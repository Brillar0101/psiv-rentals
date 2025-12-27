// src/routes/category.routes.ts
// Category Routes - Define API endpoints for categories

import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', CategoryController.getAll);

/**
 * @route   GET /api/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get('/:id', CategoryController.getById);

/**
 * @route   POST /api/categories
 * @desc    Create new category
 * @access  Private (Admin only)
 */
router.post('/', authenticate, authorize('admin'), CategoryController.create);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, authorize('admin'), CategoryController.update);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, authorize('admin'), CategoryController.delete);

export default router;
