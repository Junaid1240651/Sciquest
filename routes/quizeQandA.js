import express from 'express';
import quizeQandAController from '../controllers/quizeQandA.js';
import verifyUser from '../middleware/verifyUser.js';

const router = express.Router();

router.get('/getQuizeQandA', verifyUser, quizeQandAController.getQuizeQandA);
router.get('/getQuizeQandA/:id', verifyUser, quizeQandAController.getQuizeQuestionById);
router.post('/addQandA/:quize_id', verifyUser, quizeQandAController.addQuizeQandA);
router.patch('/updateQandA/:id', verifyUser, quizeQandAController.updateQuizeQandA);
router.delete('/deleteQandA/:id', verifyUser, quizeQandAController.deleteQuizeQandA);

export default router;