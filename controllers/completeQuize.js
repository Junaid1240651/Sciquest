import dotenv from "dotenv";
dotenv.config();
import _ from "lodash";
import userQuery from "../utils/helper/dbHelper.js";

const addCompleteQuize = async (req, res) => {
    try {
        const { userId } = req.user;
        const { quize_id, quizeQandA_id, categories_id, level_id } = req.body;

        // Validate inputs
        if (!userId || !quize_id || !quizeQandA_id || !categories_id || !level_id ) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if the completeQuize already exists
        const findCompleteQuizeQuery = `SELECT * FROM complete_quize WHERE quize_id = ? AND userId = ? AND quizeQandA_id = ? AND categories_id = ? AND level_id = ?`;
        const existingCompleteQuize = await userQuery(findCompleteQuizeQuery, [quize_id, userId, quizeQandA_id, categories_id, level_id]);

        if (existingCompleteQuize.length > 0) {
            return res.status(409).json({ message: "Complete quize already exists" });
        }

        // Check if quizeQandA and quize exist and categories exist and level exist
        const findQuizeQandAQuery = `SELECT * FROM quizeQandA WHERE id = ?`;
        const existingQuizeQandA = await userQuery(findQuizeQandAQuery, [quizeQandA_id]);

        const findQuizeQuery = `SELECT * FROM quizes WHERE id = ?`;
        const existingQuize = await userQuery(findQuizeQuery, [quize_id]);

        const findCategoriesQuery = `SELECT * FROM categories WHERE id = ?`;
        const existingCategories = await userQuery(findCategoriesQuery, [categories_id]);

        const findLevelQuery = `SELECT * FROM levels WHERE id = ?`;
        const existingLevel = await userQuery(findLevelQuery, [level_id]);

        if (existingQuizeQandA.length === 0) {
            return res.status(404).json({ message: "Quize QandA not found" });
        }

        if (existingQuize.length === 0) {
            return res.status(404).json({ message: "Quize not found" });
        }

        if (existingCategories.length === 0) {
            return res.status(404).json({ message: "Categories not found" });
        }

        if (existingLevel.length === 0) {
            return res.status(404).json({ message: "Level not found" });
        }

        // Insert new completeQuize
        const insertCompleteQuizeQuery = `
            INSERT INTO complete_quize (quize_id, userId, quizeQandA_id, categories_id, level_id)
            VALUES (?, ?, ?, ?, ?)`;

        await userQuery(insertCompleteQuizeQuery, [quize_id, userId, quizeQandA_id, categories_id, level_id]);
        
        res.status(201).json({ message: "Complete quize added successfully" });

    } catch (error) {
        res.status(500).json({
            status: "error",
            error: error.message,
        });
    }
};

const getCompleteQuizeById = async (req, res) => {
    try {
        const { id } = req.params;
        const completeQuize = await userQuery(`SELECT * FROM complete_quize WHERE id = ?`, [id]);
        if (completeQuize.length === 0) {
            return res.status(404).json({ message: "No complete quize found" });
        }
        res.status(200).json({
            status: "success",
            completeQuize,
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            error: error.message,
        });
    }
}

const getCompleteQuizeByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const completeQuize = await userQuery(`SELECT * FROM complete_quize WHERE userId = ?`, [userId]);
        if (completeQuize.length === 0) {
            return res.status(404).json({ message: "No complete quize found" });
        }
        res.status(200).json({
            status: "success",
            completeQuize,
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            error: error.message,
        });
    }
}
const updateCompleteQuize = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;
        const { quize_id, quizeQandA_id, categories_id, level_id } = req.body;

        // Validate inputs
        if (!id) {
            return res.status(400).json({ message: "ID is required" });
        }

        if (!quize_id || !quizeQandA_id || !categories_id || !level_id || !userId) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if quizeQandA and quize exist and if the completeQuize exists and categories exist
        const findQuizeQandAQuery = `SELECT * FROM quizeQandA WHERE id = ?`;
        const existingQuizeQandA = await userQuery(findQuizeQandAQuery, [quizeQandA_id]);

        const findQuizeQuery = `SELECT * FROM quizes WHERE id = ?`;
        const existingQuize = await userQuery(findQuizeQuery, [quize_id]);

        const findCompleteQuizeQuery = `SELECT * FROM complete_quize WHERE id = ?`;
        const existingCompleteQuize = await userQuery(findCompleteQuizeQuery, [id]);

        const findCategoriesQuery = `SELECT * FROM categories WHERE id = ?`;
        const existingCategories = await userQuery(findCategoriesQuery, [categories_id]);

        if (existingQuizeQandA.length === 0) {
            return res.status(404).json({ message: "Quize QandA not found" });
        }

        if (existingQuize.length === 0) {
            return res.status(404).json({ message: "Quize not found" });
        }

        if (existingCompleteQuize.length === 0) {
            return res.status(404).json({ message: "Complete quize not found" });
        }

        if (existingCategories.length === 0) {
            return res.status(404).json({ message: "Categories not found" });
        }

        // Update completeQuize
        await userQuery(
            `UPDATE complete_quize SET quize_id = ?, userId = ?, quizeQandA_id = ?, categories_id = ?, level_id = ? WHERE id = ?`,
            [quize_id, userId, quizeQandA_id, categories_id, level_id, id]
        );
        
        res.status(200).json({
            status: "success",
            message: "Complete quize updated successfully",
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            error: error.message,
        });
    }
}

const deleteCompleteQuize = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the completeQuize exists
        const findCompleteQuizeQuery = `SELECT * FROM complete_quize WHERE id = ?`;
        const existingCompleteQuize = await userQuery(findCompleteQuizeQuery, [id]);

        if (existingCompleteQuize.length === 0) {
            return res.status(404).json({ message: "Complete quize not found" });
        }

        // Delete completeQuize
        await userQuery(`DELETE FROM complete_quize WHERE id = ?`, [id]);

        res.status(200).json({
            status: "success",
            message: "Complete quize deleted successfully",
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            error: error.message,
        });
    }
}

export default { addCompleteQuize, getCompleteQuizeById, updateCompleteQuize, deleteCompleteQuize, getCompleteQuizeByUserId };