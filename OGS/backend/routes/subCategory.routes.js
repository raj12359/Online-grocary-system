import express from 'express';
import {
  getSubCategories,
  getSubCategoryById,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from '../controllers/subCategory.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.route('/')
  .get(getSubCategories)
  .post(protect, admin, upload.single('image'), createSubCategory);

router.route('/:id')
  .get(getSubCategoryById)
  .put(protect, admin, upload.single('image'), updateSubCategory)
  .delete(protect, admin, deleteSubCategory);

export default router;
