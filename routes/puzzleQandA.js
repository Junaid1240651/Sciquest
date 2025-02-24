import express from 'express';
import puzzleQandA from '../controllers/puzzleQandA.js';
import verifyUser from '../middleware/verifyUser.js';

const router = express.Router();

router.get('/getPuzzleQandA', verifyUser, puzzleQandA.getPuzzleQandA);
router.get('/getPuzzleQandA/:id', verifyUser, puzzleQandA.getPuzzleQandAById);
router.get('/getPuzzleQandAByPuzzleId/:puzzle_id', verifyUser, puzzleQandA.getPuzzleQandAByPuzzleId);
router.post('/addPuzzleQandA/:puzzle_id', verifyUser, puzzleQandA.addPuzzleQandA);
router.patch('/updatePuzzleQandA/:id', verifyUser, puzzleQandA.updatePuzzleQandA);
router.delete('/deletePuzzleQandA/:id', verifyUser, puzzleQandA.deletePuzzleQandA);

export default router;