import dotenv from "dotenv";
dotenv.config();
import _ from "lodash";
import userQuery from "../utils/helper/dbHelper.js";

const addCompletePuzzle = async (req, res) => {
    try {
        const { userId } = req.user;
        let score = 0;
        const { puzzle_id, puzzleQandA_id, categories_id, level_id, attempt, answer } = req.body;

        // Validate inputs
        if (!userId || !puzzle_id || !puzzleQandA_id || !categories_id || !level_id) {
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

        const findLeaderboardQuery = `SELECT * FROM leaderboard WHERE userId = ?`;
        const existingLeaderboard = await userQuery(findLeaderboardQuery, [userId]);

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

        if (answer === true) {
            score = existingLevel[0].score;
        }

        // Insert new completePuzzle
        const insertCompletePuzzleQuery = `
            INSERT INTO complete_puzzle (puzzle_id, userId, puzzleQandA_id, categories_id, level_id, attempt, answer, score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        await userQuery(insertCompletePuzzleQuery, [puzzle_id, userId, puzzleQandA_id, categories_id, level_id, attempt, answer, score]);

        // Insert total score in leaderboard
        if (existingLeaderboard.length > 0) {
            await userQuery(
                `UPDATE leaderboard SET total_score = ? WHERE userId = ?`,
                [score + existingLeaderboard[0].total_score, userId]
            );
        } else {
            await userQuery(
                `INSERT INTO leaderboard (userId, total_score) VALUES (?, ?)`,
                [userId, score]
            );
        }
        
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
        const { userId } = req.user;
        let score = 0;
        const { puzzle_id, puzzleQandA_id, categories_id, level_id, attempt, answer } = req.body;

        // Validate inputs
        if (!id) {
            return res.status(400).json({ message: "ID is required" });
        }

        if (!puzzle_id || !puzzleQandA_id || !categories_id || !level_id || !userId) {
            return res.status(400).json({ message: "All fields are required" });
        }

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

        const findLeaderboardQuery = `SELECT * FROM leaderboard WHERE userId = ?`;
        const existingLeaderboard = await userQuery(findLeaderboardQuery, [userId]);

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

        if (answer === true) {
            score = existingLevel[0].score;
        }

        // Update completePuzzle
        await userQuery(
            `UPDATE complete_puzzle SET puzzle_id = ?, puzzleQandA_id = ?, categories_id = ?, level_id = ?, attempt = ?, answer = ?, score = ?  WHERE id = ?`,
            [puzzle_id, puzzleQandA_id, categories_id, level_id, attempt, answer, score, id]
        );

        // Get the old score from the existing complete puzzle
        const oldScore = existingCompletePuzzle[0].score;
        let newScore;

        // Update total score in leaderboard

        if (existingLeaderboard.length > 0) {
            newScore = existingLeaderboard[0].total_score - oldScore + score;
            await userQuery(
                `UPDATE leaderboard SET total_score = ? WHERE userId = ?`,
                [newScore, userId]
            );
        } else {
            await userQuery(
                `INSERT INTO leaderboard (userId, total_score) VALUES (?, ?)`,
                [userId, score]
            );
        }
        
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