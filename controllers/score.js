import dotenv from "dotenv";
dotenv.config();
import _ from "lodash";
import userQuery from "../utils/helper/dbHelper.js";

const addScore = async (req, res) => {
    try {
        const user_id = req.user.userId;
        const { score, quize_id, puzzle_id } = req.body;

        //check if quize exists
        if (quize_id) {
            const findQuizeQuery = `SELECT * FROM quizes WHERE id = ?`;
            const existingQuize = await userQuery(findQuizeQuery, [quize_id]);

            if (existingQuize.length === 0) {
                return res.status(404).json({ message: "Quize not found" });
            }
        }

        //check if puzzle exists
        if (puzzle_id) {
            const findPuzzleQuery = `SELECT * FROM puzzle WHERE id = ?`;
            const existingPuzzle = await userQuery(findPuzzleQuery, [puzzle_id]);

            if (existingPuzzle.length === 0) {
                return res.status(404).json({ message: "Puzzle not found" });
            }
        }

        //check if record already exists with the user_id, quize_id or either puzzle_id
        const checkQuery = `SELECT * FROM scores WHERE user_id = ? AND quize_id = ? OR puzzle_id = ?`;
        const existingScore = await userQuery(checkQuery, [user_id, quize_id, puzzle_id]);

        if (existingScore.length > 0) {
            return res.status(409).json({ message: "Score already exists with this PuzzleId or QuizeId" });
        }

        // Insert new score
        await userQuery(
            `INSERT INTO scores (user_id, score, quize_id, puzzle_id) VALUES (?, ?, ?, ?)`,
            [user_id, score, quize_id, puzzle_id]
        );

        // Find the user in the leaderboard
        const findUserQuery = `SELECT * FROM leaderboard WHERE userId = ?`;
        const existingUser = await userQuery(findUserQuery, [user_id]);

        if (existingUser.length > 0) {
            // Update the user's score in the leaderboard
            await userQuery(
                `UPDATE leaderboard SET total_score = ? WHERE userId = ?`,
                [score + existingUser[0].total_score, user_id]
            );
        } else {
            // Insert inside leaderboard
            await userQuery(
                `INSERT INTO leaderboard (userId, total_score) VALUES (?, ?)`,
                [user_id, score]
            );
        }

        res.status(201).json({
            status: "success",
            message: "Score added successfully",
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            error: error.message,
        });
    }
}

const getLeaderboardScore = async (req, res) => {

}

const getTotalScoresByUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        const scores = await userQuery(`SELECT * FROM scores WHERE user_id = ?`, [user_id]);
        if (scores.length === 0) {
            return res.status(404).json({ message: "No score found" });
        }
        const totalScore = _.sumBy(scores, "score");
        res.status(200).json({
            status: "success",
            totalScore,
            user_id
        }); 
    } catch (error) {
        res.status(400).json({
            status: "error",
            error: error.message,
        });
    }
}

const updateScore = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.userId;
        const { score, quize_id, puzzle_id } = req.body;

        // Ensure score is a valid number
        const numericScore = Number(score) || 0;

        // Check if score exists
        const findScoreQuery = `SELECT * FROM scores WHERE id = ?`;
        const existingScore = await userQuery(findScoreQuery, [id]);

        if (existingScore.length === 0) {
            return res.status(404).json({ message: "Score not found" });
        }

        const oldScore = Number(existingScore[0].score || 0);
        const totalScore = numericScore - oldScore; // Change in score

        // Check if quiz exists
        if (quize_id) {
            const findQuizeQuery = `SELECT * FROM quizes WHERE id = ?`;
            const existingQuize = await userQuery(findQuizeQuery, [quize_id]);

            if (existingQuize.length === 0) {
                return res.status(404).json({ message: "Quiz not found" });
            }
        }

        // Check if puzzle exists
        if (puzzle_id) {
            const findPuzzleQuery = `SELECT * FROM puzzle WHERE id = ?`;
            const existingPuzzle = await userQuery(findPuzzleQuery, [puzzle_id]);

            if (existingPuzzle.length === 0) {
                return res.status(404).json({ message: "Puzzle not found" });
            }
        }

        // Update score in `scores` table
        await userQuery(
            `UPDATE scores SET score = ?, quize_id = ?, puzzle_id = ? WHERE id = ?`,
            [numericScore, quize_id || null, puzzle_id || null, id]
        );

        // Find the user in the leaderboard
        const findUserQuery = `SELECT * FROM leaderboard WHERE userId = ?`;
        const existingUser = await userQuery(findUserQuery, [user_id]);

        console.log("Old Score:", oldScore);
        console.log("New Score:", numericScore);
        console.log("Total Score Change:", totalScore);

        if (existingUser.length > 0) {
            // Update the user's total score in the leaderboard
            await userQuery(
                `UPDATE leaderboard SET total_score = total_score + ? WHERE userId = ?`,
                [totalScore, user_id]
            );
        }

        res.status(200).json({ status: "success", message: "Score updated successfully" });
    } catch (error) {
        res.status(400).json({
            status: "error",
            error: error.message,
        });
    }
};

const deleteScore = async (req, res) => {
    try {
        const { id } = req.params;

        //check if score exists
        const findScoreQuery = `SELECT * FROM scores WHERE id = ?`;
        const existingScore = await userQuery(findScoreQuery, [id]);

        if (existingScore.length === 0) {
            return res.status(404).json({ message: "Score not found" });
        }

        // Delete score
        await userQuery(`DELETE FROM scores WHERE id = ?`, [id]);

        res.status(200).json({
            status: "success",
            message: "Score deleted successfully",
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            error: error.message,
        });
    }
}

export default { addScore, getLeaderboardScore, getTotalScoresByUser, updateScore, deleteScore };