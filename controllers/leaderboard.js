import dotenv from "dotenv";
dotenv.config();
import _ from "lodash";
import userQuery from "../utils/helper/dbHelper.js";

const getTopLeaderboardScore = async (req, res) => {
    try {
        // Fetch top 10 leaderboard scores
        const getTopLeaderboardScoreQuery = `SELECT * FROM leaderboard ORDER BY total_score DESC LIMIT 10`;
        const topLeaderboardScore = await userQuery(getTopLeaderboardScoreQuery);

        console.log(topLeaderboardScore.length);

        // Fetch user info for all users in parallel
        const userIds = topLeaderboardScore.map(entry => entry.userId);
        console.log(userIds);

        if (userIds.length === 0) {
            return res.status(200).json({ topLeaderboardScore: [] });
        }

        const getUserInfoQuery = `
            SELECT id, username, first_name, last_name, email, mobile_number, profile_picture 
            FROM users WHERE id IN (${userIds.map(() => '?').join(',')})
        `;
        const userInfoList = await userQuery(getUserInfoQuery, userIds);

        // Correct user lookup map (using userId as key)
        const userInfoMap = Object.fromEntries(
            userInfoList.map(user => [user.id, user])
        );

        console.log(userInfoMap);

        // Attach user details to leaderboard data
        topLeaderboardScore.forEach(entry => {
            const userInfo = userInfoMap[entry.userId] || {}; // Default to empty object if user not found
            entry.username = userInfo.username || "Unknown User";
            entry.first_name = userInfo.first_name || "Unknown User";
            entry.last_name = userInfo.last_name || "Unknown User";
            entry.email = userInfo.email || "Unknown User";
            entry.mobile_number = userInfo.mobile_number || "Unknown User";
            entry.profile_picture = userInfo.profile_picture || "Unknown User";
        });

        res.status(200).json({ topLeaderboardScore });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export default { getTopLeaderboardScore };