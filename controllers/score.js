import dotenv from "dotenv";
dotenv.config();
import _ from "lodash";
import userQuery from "../utils/helper/dbHelper.js";
const getTotalScoresByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch user info first to ensure user exists
        const getUserInfoQuery = `SELECT id, username, first_name, last_name, email, mobile_number, profile_picture FROM users WHERE id = ?`;
        const userInfo = await userQuery(getUserInfoQuery, [userId]);

        if (userInfo.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch total scores from leaderboard
        const getTotalScoresByUserIdQuery = `SELECT * FROM leaderboard WHERE userId = ?`;
        const totalScores = await userQuery(getTotalScoresByUserIdQuery, [userId]);

        if (totalScores.length === 0) {
            return res.status(404).json({ message: "Score not found" });
        }

        // Attach user info to scores
        totalScores[0].userInfo = userInfo[0];

        res.status(200).json({ totalScores });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export default { getTotalScoresByUserId };