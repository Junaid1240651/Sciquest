import dotenv from "dotenv";
dotenv.config();
import _ from "lodash";
import userQuery from "../utils/helper/dbHelper.js";

// ✅ Create puzzle
const addPuzzle = async (req, res) => {
    const { name, description, categories_id, level_id } = req.body;

    // 🔸 Validate inputs
    if (!name?.trim()) {
        return res.status(400).json({ message: "Name is required" });
    }
    if (!description?.trim()) {
        return res.status(400).json({ message: "Description is required" });
    }
    if (!categories_id) {
        return res.status(400).json({ message: "Category ID is required" });
    }
    if (!level_id) {
        return res.status(400).json({ message: "Level ID is required" });
    }

    try {
        // Check if quiz already exists
        const checkQuery = `SELECT * FROM puzzle WHERE name = ?`;
        const existingQuiz = await userQuery(checkQuery, [name]);
        if (existingQuiz.length > 0) {
            return res.status(409).json({ message: "puzzle already exists" });
        }
        //check if category exists
        const findCategoryQuery = `SELECT * FROM categories WHERE id = ?`;
        const existingCategory = await userQuery(findCategoryQuery, [categories_id]);

        if (existingCategory.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }
        // Insert new quiz
        const insertQuery = `INSERT INTO puzzle (name, description, categories_id, level_id) VALUES (?, ?, ?, ?)`;
        const newQuiz = await userQuery(insertQuery, [name, description, categories_id, level_id]);

        if (newQuiz.affectedRows === 1) {
            return res.status(201).json({ message: "puzzle added successfully" });
        }
        return res.status(500).json({ message: "Failed to add puzzle" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ✅ Get All puzzles
const getPuzzles = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.*, 
                c.name AS category_name, 
                l.type AS level_name
            FROM puzzle p
            LEFT JOIN categories c ON p.categories_id = c.id
            LEFT JOIN levels l ON p.level_id = l.id
        `;

        const puzzles = await userQuery(query);

        if (puzzles.length > 0) {
            return res.status(200).json({ puzzles });
        }
        return res.status(404).json({ message: "No puzzles found" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ✅ Get Single Puzzle by ID
const getPuzzleById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT 
                p.*, 
                c.name AS category_name, 
                l.type AS level_name 
            FROM puzzle p
            LEFT JOIN categories c ON p.categories_id = c.id
            LEFT JOIN levels l ON p.level_id = l.id
            WHERE p.id = ?
        `;
        const puzzle = await userQuery(query, [id]);

        if (puzzle.length > 0) {
            return res.status(200).json({ puzzle: puzzle[0] });
        }
        return res.status(404).json({ message: "Puzzle not found" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ✅ Get Puzzle by Categories ID
const getPuzzleByCategoriesId = async (req, res) => {
    const { categories_id } = req.params;
    try {
        // Check if the category exists
        const categoryQuery = `SELECT * FROM categories WHERE id = ?`;
        const category = await userQuery(categoryQuery, [categories_id]);

        if (category.length === 0) {
            return res.status(404).json({ message: "Category doesn't exist" });
        }

        // Get puzzles with category & level details
        const getPuzzleByCategoriesIdQuery = `
            SELECT 
                p.*, 
                c.name AS category_name, 
                l.type AS level_name
            FROM puzzle p
            LEFT JOIN categories c ON p.categories_id = c.id
            LEFT JOIN levels l ON p.level_id = l.id
            WHERE p.categories_id = ?
        `;
        const puzzles = await userQuery(getPuzzleByCategoriesIdQuery, [categories_id]);

        if (puzzles.length > 0) {
            return res.status(200).json({ puzzles });
        }
        return res.status(404).json({ message: "No puzzles found" });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ✅ Get Puzzle by Level ID
const getPuzzleByLevelId = async (req, res) => {
    const { level_id } = req.params;

    try {
        // Check if level exists
        const findLevelQuery = `SELECT * FROM levels WHERE id = ?`;
        const existingLevel = await userQuery(findLevelQuery, [level_id]);

        if (existingLevel.length === 0) {
            return res.status(404).json({ message: "Level not found" });
        }

        // Get Puzzles by Level ID with Category Name
        const getPuzzlesByLevelId = `
            SELECT p.*, c.name AS category_name 
            FROM puzzle p
            JOIN categories c ON p.categories_id = c.id
            WHERE p.level_id = ?`;

        const puzzles = await userQuery(getPuzzlesByLevelId, [level_id]);

        if (puzzles.length > 0) {
            return res.status(200).json({
                level: existingLevel[0].type,
                puzzles: puzzles.map(p => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    categories_id: p.categories_id,
                    category_name: p.category_name, // Added category name
                    level_id: p.level_id,
                    level: existingLevel[0].type
                }))
            });
        }
        return res.status(404).json({ message: "No puzzles found" });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ✅ Get Puzzle by Categories ID and Level ID
const getPuzzleByCategoriesIdAndLevelId = async (req, res) => {
    const { categories_id, level_id } = req.body;

    try {
        // Check if category exists
        const findCategoryQuery = `SELECT * FROM categories WHERE id = ?`;
        const existingCategory = await userQuery(findCategoryQuery, [categories_id]);

        if (existingCategory.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Check if level exists
        const findLevelQuery = `SELECT * FROM levels WHERE id = ?`;
        const existingLevel = await userQuery(findLevelQuery, [level_id]);

        if (existingLevel.length === 0) {
            return res.status(404).json({ message: "Level not found" });
        }

        // Get Puzzles by Categories ID and Level ID
        const getPuzzlesByCategoriesIdAndLevelId = `SELECT * FROM puzzle WHERE categories_id = ? AND level_id = ?`;
        const puzzles = await userQuery(getPuzzlesByCategoriesIdAndLevelId, [categories_id, level_id]);

        if (puzzles.length > 0) {
            return res.status(200).json({
                level: existingLevel[0].type,
                category: existingCategory[0].name,
                puzzles: puzzles
            });
        }
        return res.status(404).json({ message: "No puzzles found" });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ✅ Update Puzzle
const updatePuzzle = async (req, res) => {
    const { id } = req.params;
    const { name, description, categories_id } = req.body;

    try {
        // Check if quiz exists
        const checkQuery = `SELECT * FROM puzzle WHERE id = ?`;
        const quiz = await userQuery(checkQuery, [id]);

        if (quiz.length === 0) {
            return res.status(404).json({ message: "Puzzle not found" });
        }

        //check if category exists
        const findCategoryQuery = `SELECT * FROM categories WHERE id = ?`;
        const existingCategory = await userQuery(findCategoryQuery, [categories_id]);

        if (existingCategory.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Update quiz
        const updateQuery = `UPDATE puzzle SET name = ?, description = ?, categories_id = ? WHERE id = ?`;
        const updatedQuiz = await userQuery(updateQuery, [name, description, categories_id, id]);

        if (updatedQuiz.affectedRows === 1) {
            return res.status(200).json({ message: "Puzzle updated successfully" });
        }
        return res.status(500).json({ message: "Failed to update puzzle" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ✅ Delete Puzzle
const deletePuzzle = async (req, res) => {
    const { id } = req.params;

    try {
        const deleteQuery = `DELETE FROM puzzle WHERE id = ?`;
        const deletedQuiz = await userQuery(deleteQuery, [id]);

        if (deletedQuiz.affectedRows === 1) {
            return res.status(200).json({ message: "Quiz deleted successfully" });
        }
        return res.status(404).json({ message: "Quiz not found" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export default { addPuzzle, getPuzzles, getPuzzleById, getPuzzleByCategoriesId, updatePuzzle, deletePuzzle, getPuzzleByLevelId, getPuzzleByCategoriesIdAndLevelId };