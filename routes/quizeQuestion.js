import express from 'express';
import quizeQuestionController from '../controllers/quizeQuestion.js';
import verifyUser from '../middleware/verifyUser.js';

const router = express.Router();

router.get('/getQuizeQandA', verifyUser, quizeQuestionController.getQuizeQandA);
router.get('/getQuizeQandA/:id', verifyUser, quizeQuestionController.getQuizeQuestionById);
router.post('/addQandA/:quize_id', verifyUser, quizeQuestionController.addQuizeQandA);
router.patch('/updateQandA/:id', verifyUser, quizeQuestionController.updateQuizeQandA);
router.delete('/deleteQandA/:id', verifyUser, quizeQuestionController.deleteQuizeQandA);

export default router;