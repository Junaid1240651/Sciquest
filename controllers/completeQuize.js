import dotenv from "dotenv";
dotenv.config();
import _ from "lodash";
import userQuery from "../utils/helper/dbHelper.js";

const addCompleteQuize = async (req, res) => {
    try {
        const { userId } = req.user;
        let score = 0;
        const { quize_id, quizeQandA_id, categories_id, level_id, attempt, answer } = req.body;

        // Validate inputs
        if (!userId || !quize_id || !quizeQandA_id || !categories_id || !level_id) {
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

        const findLeaderboardQuery = `SELECT * FROM leaderboard WHERE userId = ?`;
        const existingLeaderboard = await userQuery(findLeaderboardQuery, [userId]);

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

        if (answer === true) {
            score = existingLevel[0].score;
        }

        // Insert new completeQuize
        const insertCompleteQuizeQuery = `
            INSERT INTO complete_quize (quize_id, userId, quizeQandA_id, categories_id, level_id, attempt, answer, score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        await userQuery(insertCompleteQuizeQuery, [quize_id, userId, quizeQandA_id, categories_id, level_id, attempt, answer, score]);
        
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
        let score = 0;
        const { quize_id, quizeQandA_id, categories_id, level_id, attempt, answer  } = req.body;

        // Validate inputs
        if (!id) {
            return res.status(400).json({ message: "ID is required" });
        }

        if (!quize_id || !quizeQandA_id || !categories_id || !level_id || !userId) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if the completeQuize exists
        const findCompleteQuizeQuery = `SELECT * FROM complete_quize WHERE id = ?`;
        const existingCompleteQuize = await userQuery(findCompleteQuizeQuery, [id]);

        // Check if quizeQandA and quize exist and if the completeQuize exists and categories exist
        const findQuizeQandAQuery = `SELECT * FROM quizeQandA WHERE id = ?`;
        const existingQuizeQandA = await userQuery(findQuizeQandAQuery, [quizeQandA_id]);

        const findQuizeQuery = `SELECT * FROM quizes WHERE id = ?`;
        const existingQuize = await userQuery(findQuizeQuery, [quize_id]);

        const findCategoriesQuery = `SELECT * FROM categories WHERE id = ?`;
        const existingCategories = await userQuery(findCategoriesQuery, [categories_id]);

        const findLevelQuery = `SELECT * FROM levels WHERE id = ?`;
        const existingLevel = await userQuery(findLevelQuery, [level_id]);

        const findLeaderboardQuery = `SELECT * FROM leaderboard WHERE userId = ?`;
        const existingLeaderboard = await userQuery(findLeaderboardQuery, [userId]);

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

        if (existingLevel.length === 0) {
            return res.status(404).json({ message: "Level not found" });
        }

        if (answer === true) {
            score = existingLevel[0].score;
        }

        // Update completeQuize
        await userQuery(
            `UPDATE complete_quize 
             SET quize_id = ?, userId = ?, quizeQandA_id = ?, categories_id = ?, level_id = ?, attempt = ?, answer = ? , score = ?
             WHERE id = ?`,
            [quize_id, userId, quizeQandA_id, categories_id, level_id, attempt, answer, score, id] // Corrected order
        );

        // Get the old score from the existing complete puzzle
        const oldScore = existingCompleteQuize[0].score;
        let newScore;

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