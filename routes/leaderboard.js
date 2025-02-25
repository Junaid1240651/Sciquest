import express from 'express';
import leaderboardController from '../controllers/leaderboard.js';
import verifyUser from '../middleware/verifyUser.js';
const router = express.Router();

router.get('/getTopLeaderboardScore', verifyUser, leaderboardController.getTopLeaderboardScore);
router.delete('/deleteLeaderboardScore/:id', verifyUser, leaderboardController.deleteLeaderboardScore);

export default router;