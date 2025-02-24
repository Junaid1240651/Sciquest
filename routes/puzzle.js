import express from 'express';
import quizeController from '../controllers/puzzle.js';
import verifyUser from '../middleware/verifyUser.js';

const router = express.Router();

router.get('/getPuzzles', verifyUser, quizeController.getPuzzles);
router.get('/getPuzzle/:id', verifyUser, quizeController.getPuzzleById);
router.get('/getPuzzleByCategories/:categories_id', verifyUser, quizeController.getPuzzleByCategoriesId);
router.post('/addPuzzle', verifyUser, quizeController.addPuzzle);
router.patch('/updatePuzzle/:id', verifyUser, quizeController.updatePuzzle);
router.delete('/deletePuzzle/:id', verifyUser, quizeController.deletePuzzle);

export default router;