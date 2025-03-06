import express from 'express';
import quizeController from '../controllers/quize.js';
import verifyUser from '../middleware/verifyUser.js';

const router = express.Router();

router.get('/getQuizes', verifyUser, quizeController.getQuizes);
router.get('/getQuize/:id', verifyUser, quizeController.getQuizeById);
router.get('/getQuizeByCategories/:categories_id', verifyUser, quizeController.getQuizeByCategoriesId);
router.get('/getQuizeByLevelId/:level_id', verifyUser, quizeController.getQuizeByLevelId);
router.get('/getQuizeByCategoriesIdAndLevelId', verifyUser, quizeController.getQuizeByCategoriesIdAndLevelId);
router.post('/addQuize', verifyUser, quizeController.addQuize);
router.patch('/updateQuize/:id', verifyUser, quizeController.updateQuize);
router.delete('/deleteQuize/:id', verifyUser, quizeController.deleteQuize);

export default router;