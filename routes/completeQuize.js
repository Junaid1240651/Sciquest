import express from 'express';
import completeQuizeController from '../controllers/completeQuize.js';
import verifyUser from '../middleware/verifyUser.js';

const router = express.Router();

router.get('/getCompleteQuize/:id', verifyUser, completeQuizeController.getCompleteQuizeById);
router.get('/getCompleteQuizeByUserId/:userId', verifyUser, completeQuizeController.getCompleteQuizeByUserId);
router.post('/addCompleteQuize', verifyUser, completeQuizeController.addCompleteQuize);
router.patch('/updateCompleteQuize/:id', verifyUser, completeQuizeController.updateCompleteQuize);
router.delete('/deleteCompleteQuize/:id', verifyUser, completeQuizeController.deleteCompleteQuize);

export default router;