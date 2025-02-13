import dotenv from "dotenv";
dotenv.config();
import _ from "lodash";
import userQuery from "../utils/helper/dbHelper.js";

// ✅ Create puzzle
const addPuzzle = async (req, res) => {
    const { name, description, categories_id } = req.body;

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
        const insertQuery = `INSERT INTO puzzle (name, description, categories_id) VALUES (?, ?, ?)`;
        const newQuiz = await userQuery(insertQuery, [name, description, categories_id]);

        if (newQuiz.affectedRows === 1) {
            return res.status(201).json({ message: "puzzle added successfully" });
        }
        return res.status(500).json({ message: "Failed to add quiz" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ✅ Get All puzzles
const getPuzzles = async (req, res) => {
    try {
        const query = `SELECT * FROM quizes`;
        const quizzes = await userQuery(query);

        if (quizzes.length > 0) {
            return res.status(200).json({ quizzes });
        }
        return res.status(404).json({ message: "No quizzes found" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ✅ Get Single Puzzle by ID
const getPuzzleById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `SELECT * FROM quizzes WHERE id = ?`;
        const quiz = await userQuery(query, [id]);

        if (quiz.length > 0) {
            return res.status(200).json({ quiz: quiz[0] });
        }
        return res.status(404).json({ message: "Quiz not found" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ✅ Update Puzzle
const updatePuzzle = async (req, res) => {
    const { id } = req.params;
    const { name, description, type, categories_id } = req.body;

    try {
        // Check if quiz exists
        const checkQuery = `SELECT * FROM quizzes WHERE id = ?`;
        const quiz = await userQuery(checkQuery, [id]);

        if (quiz.length === 0) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        // Update quiz
        const updateQuery = `UPDATE quizzes SET name = ?, description = ?, type = ?, categories_id = ? WHERE id = ?`;
        const updatedQuiz = await userQuery(updateQuery, [name, description, type, categories_id, id]);

        if (updatedQuiz.affectedRows === 1) {
            return res.status(200).json({ message: "Quiz updated successfully" });
        }
        return res.status(500).json({ message: "Failed to update quiz" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ✅ Delete Puzzle
const deletePuzzle = async (req, res) => {
    const { id } = req.params;

    try {
        const deleteQuery = `DELETE FROM quizzes WHERE id = ?`;
        const deletedQuiz = await userQuery(deleteQuery, [id]);

        if (deletedQuiz.affectedRows === 1) {
            return res.status(200).json({ message: "Quiz deleted successfully" });
        }
        return res.status(404).json({ message: "Quiz not found" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export default { addPuzzle, getPuzzles, getPuzzleById, updatePuzzle, deletePuzzle };