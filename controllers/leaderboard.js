import dotenv from "dotenv";
dotenv.config();
import _ from "lodash";
import userQuery from "../utils/helper/dbHelper.js";

const getTopLeaderboardScore = async (req, res) => {
    try {
        const getTopLeaderboardScoreQuery = `SELECT * FROM leaderboard ORDER BY total_score DESC LIMIT 10`;
        const topLeaderboardScore = await userQuery(getTopLeaderboardScoreQuery);
        res.status(200).json({ topLeaderboardScore });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const deleteLeaderboardScore = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        //check if record exists
        const checkQuery = `SELECT * FROM leaderboard WHERE id = ?`;
        const existingScore = await userQuery(checkQuery, [id]);

        if (existingScore.length === 0) {
            return res.status(404).json({ message: "Leaderboard score not found" });
        }
        //delete score from leaderboard table
        await userQuery(`DELETE FROM leaderboard WHERE id = ?`, [id]);

        //delete score from scores table
        await userQuery(`DELETE FROM scores WHERE user_id = ?`, [userId]);
        res.status(200).json({ message: "Leaderboard score deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

export default { getTopLeaderboardScore, deleteLeaderboardScore };