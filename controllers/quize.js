import dotenv from "dotenv";
dotenv.config();
import _ from "lodash";
import userQuery from "../utils/helper/dbHelper.js";

// ✅ Create Quiz
const addQuize = async (req, res) => {
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
        // 🔸 Check if Level exists
        const findLevelQuery = `SELECT * FROM levels WHERE id = ?`;
        const existingLevel = await userQuery(findLevelQuery, [level_id]);

        if (existingLevel.length === 0) {
            return res.status(404).json({ message: "Level not found" });
        }
        // Check if quiz already exists
        const checkQuery = `SELECT * FROM quizes WHERE name = ?`;
        const existingQuiz = await userQuery(checkQuery, [name]);
        if (existingQuiz.length > 0) {
            return res.status(409).json({ message: "Quiz already exists" });
        }
        //check if category exists
        const findCategoryQuery = `SELECT * FROM categories WHERE id = ?`;
        const existingCategory = await userQuery(findCategoryQuery, [categories_id]);

        if (existingCategory.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }
        // Insert new quiz
        const insertQuery = `INSERT INTO quizes (name, description, categories_id, level_id) VALUES (?, ?, ?, ?)`;
        const newQuiz = await userQuery(insertQuery, [name, description, categories_id, level_id]);

        if (newQuiz.affectedRows === 1) {
            return res.status(201).json({ message: "Quiz added successfully" });
        }
        return res.status(500).json({ message: "Failed to add quiz" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ✅ Get All Quizzes
const getQuizes = async (req, res) => {
    try {
        const query = `
            SELECT 
                q.*, 
                c.name AS category_name, 
                l.type AS level_name
            FROM quizes q
            LEFT JOIN categories c ON q.categories_id = c.id
            LEFT JOIN levels l ON q.level_id = l.id
        `;

        const quizzes = await userQuery(query);

        if (quizzes.length > 0) {
            return res.status(200).json({ quizzes });
        }
        return res.status(404).json({ message: "No quizzes found" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ✅ Get Single Quiz by ID
const getQuizeById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT 
                q.*, 
                c.name AS category_name, 
                l.type AS level_name
            FROM quizes q
            LEFT JOIN categories c ON q.categories_id = c.id
            LEFT JOIN levels l ON q.level_id = l.id
            WHERE q.id = ?
        `;

        const quiz = await userQuery(query, [id]);

        if (quiz.length > 0) {
            return res.status(200).json({ quiz: quiz[0] });
        }
        return res.status(404).json({ message: "Quiz not found" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ✅ Get Quiz by Categories ID
const getQuizeByCategoriesId = async (req, res) => {
    const { categories_id } = req.params;
    try {
        // Check if category exists
        const findCategoryQuery = `SELECT * FROM categories WHERE id = ?`;
        const existingCategory = await userQuery(findCategoryQuery, [categories_id]);

        if (existingCategory.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Get Quizzes by Categories ID with Level Name
        const getQuizzesByCategoriesId = `
            SELECT q.*, l.type AS level_name 
            FROM quizes q
            JOIN levels l ON q.level_id = l.id
            WHERE q.categories_id = ?`;

        const quizzes = await userQuery(getQuizzesByCategoriesId, [categories_id]);

        if (quizzes.length > 0) {
            return res.status(200).json({
                category: existingCategory[0].name, // Added category name
                quizzes: quizzes.map(q => ({
                    id: q.id,
                    name: q.name,
                    description: q.description,
                    categories_id: q.categories_id,
                    category_name: existingCategory[0].name, // Category Name
                    level_id: q.level_id,
                    level_name: q.level_name, // Added level name
                }))
            });
        }
        return res.status(404).json({ message: "No quizzes found" });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


// ✅ Get Quiz by Level ID
const getQuizeByLevelId = async (req, res) => {
    const { level_id } = req.params;

    try {
        // Check if level exists
        const findLevelQuery = `SELECT * FROM levels WHERE id = ?`;
        const existingLevel = await userQuery(findLevelQuery, [level_id]);

        if (existingLevel.length === 0) {
            return res.status(404).json({ message: "Level not found" });
        }

        // Get Quizzes by Level ID with Category Name
        const getQuizzesByLevelId = `
            SELECT q.*, c.name AS category_name 
            FROM quizes q
            JOIN categories c ON q.categories_id = c.id
            WHERE q.level_id = ?`;

        const quizzes = await userQuery(getQuizzesByLevelId, [level_id]);

        if (quizzes.length > 0) {
            return res.status(200).json({
                level: existingLevel[0].type,
                quizzes: quizzes.map(q => ({
                    id: q.id,
                    name: q.name,
                    description: q.description,
                    categories_id: q.categories_id,
                    category_name: q.category_name, // Added category name
                    level_id: q.level_id,
                    level: existingLevel[0].type
                }))
            });
        }
        return res.status(404).json({ message: "No quizzes found" });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ✅ Get Quiz by Categories ID and Level ID
const getQuizeByCategoriesIdAndLevelId = async (req, res) => {
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

        // Get Quizzes by Categories ID and Level ID
        const getQuizzesByCategoriesIdAndLevelId = `SELECT * FROM quizes WHERE categories_id = ? AND level_id = ?`;
        const quizzes = await userQuery(getQuizzesByCategoriesIdAndLevelId, [categories_id, level_id]);

        if (quizzes.length > 0) {
            return res.status(200).json({
                level: existingLevel[0].type,  // Correcting property name
                category: existingCategory[0].name,
                quizzes: quizzes  // No need to return quizzes twice
            });
        }
        return res.status(404).json({ message: "No quizzes found" });
        
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ✅ Update Quiz
const updateQuize = async (req, res) => {
    const { id } = req.params;
    const { name, description, categories_id, level_id } = req.body;

    try {
        // Check if quiz exists
        const checkQuery = `SELECT * FROM quizes WHERE id = ?`;
        const quiz = await userQuery(checkQuery, [id]);

        if (quiz.length === 0) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        //check if category exists
        const findCategoryQuery = `SELECT * FROM categories WHERE id = ?`;
        const existingCategory = await userQuery(findCategoryQuery, [categories_id]);

        if (existingCategory.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }
        //check if level exists
        const findLevelQuery = `SELECT * FROM levels WHERE id = ?`;
        const existingLevel = await userQuery(findLevelQuery, [level_id]);

        if (existingLevel.length === 0) {
            return res.status(404).json({ message: "Level not found" });
        }

        // Update quiz
        const updateQuery = `UPDATE quizes SET name = ?, description = ?, categories_id = ? WHERE id = ?, level_id = ?`;
        const updatedQuiz = await userQuery(updateQuery, [name, description, categories_id, id, level_id]);

        if (updatedQuiz.affectedRows === 1) {
            return res.status(200).json({ message: "Quiz updated successfully" });
        }
        return res.status(500).json({ message: "Failed to update quiz" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ✅ Delete Quiz
const deleteQuize = async (req, res) => {
    const { id } = req.params;

    try {
        const deleteQuery = `DELETE FROM quizes WHERE id = ?`;
        const deletedQuiz = await userQuery(deleteQuery, [id]);

        if (deletedQuiz.affectedRows === 1) {
            return res.status(200).json({ message: "Quiz deleted successfully" });
        }
        return res.status(404).json({ message: "Quiz not found" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export default { addQuize, getQuizes, getQuizeById, getQuizeByCategoriesId, updateQuize, deleteQuize, getQuizeByLevelId, getQuizeByCategoriesIdAndLevelId };