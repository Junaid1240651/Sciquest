import dotenv from "dotenv";
dotenv.config();
import _ from "lodash";
import userQuery from "../utils/helper/dbHelper.js";

const addCompletePuzzle = async (req, res) => {
    try {
        const { userId } = req.user;
        const { puzzle_id, puzzleQandA_id, categories_id, level_id } = req.body;

        // Validate inputs
        if (!userId || !puzzle_id || !puzzleQandA_id || !categories_id || !level_id ) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if the completePuzzle already exists
        const findCompletePuzzleQuery = `SELECT * FROM complete_puzzle WHERE puzzle_id = ? AND userId = ? AND puzzleQandA_id = ? AND categories_id = ? AND level_id = ?`;
        const existingCompletePuzzle = await userQuery(findCompletePuzzleQuery, [puzzle_id, userId, puzzleQandA_id, categories_id, level_id]);

        if (existingCompletePuzzle.length > 0) {
            return res.status(409).json({ message: "Complete puzzle already exists" });
        }

        // Check if puzzleQandA and puzzle exist and categories exist and level exist
        const findPuzzleQandAQuery = `SELECT * FROM puzzleQandA WHERE id = ?`;
        const existingPuzzleQandA = await userQuery(findPuzzleQandAQuery, [puzzleQandA_id]);

        const findPuzzleQuery = `SELECT * FROM puzzle WHERE id = ?`;
        const existingPuzzle = await userQuery(findPuzzleQuery, [puzzle_id]);

        const findCategoriesQuery = `SELECT * FROM categories WHERE id = ?`;
        const existingCategories = await userQuery(findCategoriesQuery, [categories_id]);

        const findLevelQuery = `SELECT * FROM levels WHERE id = ?`;
        const existingLevel = await userQuery(findLevelQuery, [level_id]);

        if (existingPuzzleQandA.length === 0) {
            return res.status(404).json({ message: "Puzzle QandA not found" });
        }

        if (existingPuzzle.length === 0) {
            return res.status(404).json({ message: "Puzzle not found" });
        }

        if (existingCategories.length === 0) {
            return res.status(404).json({ message: "Categories not found" });
        }

        if (existingLevel.length === 0) {
            return res.status(404).json({ message: "Level not found" });
        }
        // Insert new completePuzzle
        const insertCompletePuzzleQuery = `
            INSERT INTO complete_puzzle (puzzle_id, userId, puzzleQandA_id, categories_id, level_id)
            VALUES (?, ?, ?, ?, ?)`;

        await userQuery(insertCompletePuzzleQuery, [puzzle_id, userId, puzzleQandA_id, categories_id, level_id]);
        
        res.status(201).json({ message: "Complete puzzle added successfully" });

    } catch (error) {
        res.status(500).json({
            status: "error",
            error: error.message,
        });
    }
}

const getCompletePuzzleById = async (req, res) => {
    try {
        const { id } = req.params;
        const completePuzzle = await userQuery(`SELECT * FROM complete_puzzle WHERE id = ?`, [id]);
        if (completePuzzle.length === 0) {
            return res.status(404).json({ message: "No complete puzzle found" });
        }
        res.status(200).json({
            status: "success",
            completePuzzle,
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            error: error.message,
        });
    }
}

const getCompletePuzzleByUserId = async (req, res) => {
    try {
        const { userId } = req.user;
        const completePuzzle = await userQuery(`SELECT * FROM complete_puzzle WHERE userId = ?`, [userId]);
        if (completePuzzle.length === 0) {
            return res.status(404).json({ message: "No complete puzzle found" });
        }
        res.status(200).json({
            status: "success",
            completePuzzle,
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            error: error.message,
        });
    }
}
const updateCompletePuzzle = async (req, res) => {
    try {
        const { id } = req.params;
        const { puzzle_id, puzzleQandA_id, categories_id, level_id } = req.body;

        // Check if the completePuzzle exists
        const findCompletePuzzleQuery = `SELECT * FROM complete_puzzle WHERE id = ?`;
        const existingCompletePuzzle = await userQuery(findCompletePuzzleQuery, [id]);

        if (existingCompletePuzzle.length === 0) {
            return res.status(404).json({ message: "Complete puzzle not found" });
        }

        // Check if puzzleQandA and puzzle exist and categories exist and level exist
        const findPuzzleQandAQuery = `SELECT * FROM puzzleQandA WHERE id = ?`;
        const existingPuzzleQandA = await userQuery(findPuzzleQandAQuery, [puzzleQandA_id]);

        const findPuzzleQuery = `SELECT * FROM puzzle WHERE id = ?`;
        const existingPuzzle = await userQuery(findPuzzleQuery, [puzzle_id]);

        const findCategoriesQuery = `SELECT * FROM categories WHERE id = ?`;
        const existingCategories = await userQuery(findCategoriesQuery, [categories_id]);

        const findLevelQuery = `SELECT * FROM levels WHERE id = ?`;
        const existingLevel = await userQuery(findLevelQuery, [level_id]);

        if (existingPuzzleQandA.length === 0) {
            return res.status(404).json({ message: "Puzzle QandA not found" });
        }

        if (existingPuzzle.length === 0) {
            return res.status(404).json({ message: "Puzzle not found" });
        }

        if (existingCategories.length === 0) {
            return res.status(404).json({ message: "Categories not found" });
        }

        if (existingLevel.length === 0) {
            return res.status(404).json({ message: "Level not found" });
        }

        // Update completePuzzle
        await userQuery(
            `UPDATE complete_puzzle SET puzzle_id = ?, puzzleQandA_id = ?, categories_id = ?, level_id = ? WHERE id = ?`,
            [puzzle_id, puzzleQandA_id, categories_id, level_id, id]
        );

        res.status(200).json({
            status: "success",
            message: "Complete Puzzle updated successfully"
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            error: error.message,
        });
    }
}

const deleteCompletePuzzle = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the completePuzzle exists
        const findCompletePuzzleQuery = `SELECT * FROM complete_puzzle WHERE id = ?`;
        const existingCompletePuzzle = await userQuery(findCompletePuzzleQuery, [id]);

        if (existingCompletePuzzle.length === 0) {
            return res.status(404).json({ message: "Complete puzzle not found" });
        }

        await userQuery(`DELETE FROM complete_puzzle WHERE id = ?`, [id]);

        res.status(200).json({
            status: "success",
            message: "Complete puzzle deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            error: error.message,
        });
    }
}

export default { addCompletePuzzle, getCompletePuzzleById, updateCompletePuzzle, deleteCompletePuzzle, getCompletePuzzleByUserId };