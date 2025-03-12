import express from 'express';
import scoreController from '../controllers/score.js';
import verifyUser from '../middleware/verifyUser.js';
const router = express.Router();

router.get('/getTotalScoresByUser/:userId', verifyUser, scoreController.getTotalScoresByUserId);

export default router;