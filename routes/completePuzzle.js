import express from 'express';
import completePuzzleController from '../controllers/completePuzzle.js';
import verifyUser from '../middleware/verifyUser.js';

const router = express.Router();

router.get('/getCompletePuzzle/:id', verifyUser, completePuzzleController.getCompletePuzzleById);
router.get('/getCompletePuzzleByUserId/:userId', verifyUser, completePuzzleController.getCompletePuzzleByUserId);
router.post('/addCompletePuzzle', verifyUser, completePuzzleController.addCompletePuzzle);
router.patch('/updateCompletePuzzle/:id', verifyUser, completePuzzleController.updateCompletePuzzle);
router.delete('/deleteCompletePuzzle/:id', verifyUser, completePuzzleController.deleteCompletePuzzle);

export default router;