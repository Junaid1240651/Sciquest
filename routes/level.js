import express from 'express';
import levelController from '../controllers/level.js';
import verifyUser from '../middleware/verifyUser.js';
const router = express.Router();

router.get('/getLevels', verifyUser, levelController.getLevels);
router.post('/addLevel', verifyUser, levelController.addLevel);
router.patch('/updateLevel', verifyUser, levelController.updateLevel);
router.delete('/deleteLevel/:id', verifyUser, levelController.deleteLevel);

export default router;