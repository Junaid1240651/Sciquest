import express from 'express';
import categoryController from '../controllers/category.js';
import verifyUser from '../middleware/verifyUser.js';
const router = express.Router();

router.get('/getCategories', verifyUser, categoryController.getCategories);
router.get('/getCategoriesByLevel/:level_id', verifyUser, categoryController.getCategoriesByLevel);
router.post('/addCategory', verifyUser, categoryController.addCategory);
router.patch('/updateCategory', verifyUser, categoryController.updateCategory);
router.delete('/deleteCategory/:id', verifyUser, categoryController.deleteCategory);

export default router;