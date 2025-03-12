import dotenv from "dotenv";
dotenv.config();
import _ from "lodash";
import userQuery from "../utils/helper/dbHelper.js";

const getTotalScoresByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const getTotalScoresByUserIdQuery = `SELECT * FROM leaderboard WHERE userId = ?`;
        const totalScores = await userQuery(getTotalScoresByUserIdQuery, [userId]);
        
        res.status(200).json({ totalScores });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

export default { getTotalScoresByUserId };