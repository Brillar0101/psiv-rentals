// src/routes/equipment.routes.ts
// Equipment Routes - WITH FEATURED ENDPOINT

import { Router } from 'express';
import { EquipmentController } from '../controllers/equipment.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/equipment/featured
 * @desc    Get featured equipment (top rated)
 * @access  Public
 */
router.get('/featured', EquipmentController.getFeatured);

/**
 * @route   GET /api/equipment/category/:categoryId
 * @desc    Get equipment by category
 * @access  Public
 */
router.get('/category/:categoryId', EquipmentController.getByCategory);

/**
 * @route   GET /api/equipment
 * @desc    Get all equipment (with search/filter)
 * @access  Public
 */
router.get('/', EquipmentController.getAll);

/**
 * @route   GET /api/equipment/:id
 * @desc    Get equipment by ID
 * @access  Public
 */
router.get('/:id', EquipmentController.getById);

/**
 * @route   POST /api/equipment
 * @desc    Create new equipment
 * @access  Private (Admin only)
 */
router.post('/', authenticate, authorize('admin'), EquipmentController.create);

/**
 * @route   PUT /api/equipment/:id
 * @desc    Update equipment
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, authorize('admin'), EquipmentController.update);

/**
 * @route   PATCH /api/equipment/:id/availability
 * @desc    Update equipment availability
 * @access  Private (Admin only)
 */
router.patch('/:id/availability', authenticate, authorize('admin'), EquipmentController.updateAvailability);

/**
 * @route   DELETE /api/equipment/:id
 * @desc    Delete equipment
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, authorize('admin'), EquipmentController.delete);

export default router;
