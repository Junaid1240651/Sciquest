import express from 'express';
import scoreController from '../controllers/score.js';
import verifyUser from '../middleware/verifyUser.js';
const router = express.Router();

router.get('/getLeaderboardScore', verifyUser, scoreController.getLeaderboardScore);
router.get('/getTotalScoresByUser/:user_id', verifyUser, scoreController.getTotalScoresByUser);
router.post('/addScore', verifyUser, scoreController.addScore);
router.patch('/updateScore/:id', verifyUser, scoreController.updateScore);
router.delete('/deleteScore/:id', verifyUser, scoreController.deleteScore);

export default router;