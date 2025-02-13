import dotenv from "dotenv";
dotenv.config();
import _ from "lodash";
import userQuery from "../utils/helper/dbHelper.js";

// ✅ Create Quiz
const addQuize = async (req, res) => {
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
        const insertQuery = `INSERT INTO quizes (name, description, categories_id) VALUES (?, ?, ?)`;
        const newQuiz = await userQuery(insertQuery, [name, description, categories_id]);

        if (newQuiz.affectedRows === 1) {
            return res.status(201).json({ message: "Quiz added successfully" });
        }
        return res.status(500).json({ message: "Failed to add quiz" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ✅ Get All Quizes
const getQuizes = async (req, res) => {
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

// ✅ Get Single Quiz by ID
const getQuizeById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `SELECT * FROM quizes WHERE id = ?`;
        const quiz = await userQuery(query, [id]);

        if (quiz.length > 0) {
            return res.status(200).json({ quiz: quiz[0] });
        }
        return res.status(404).json({ message: "Quiz not found" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ✅ Update Quiz
const updateQuize = async (req, res) => {
    const { id } = req.params;
    const { name, description, categories_id } = req.body;

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
        // Update quiz
        const updateQuery = `UPDATE quizes SET name = ?, description = ?, categories_id = ? WHERE id = ?`;
        const updatedQuiz = await userQuery(updateQuery, [name, description, categories_id, id]);

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

export default { addQuize, getQuizes, getQuizeById, updateQuize, deleteQuize };