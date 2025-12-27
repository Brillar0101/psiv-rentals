// src/routes/booking.routes.ts
// Booking Routes - Define API endpoints for bookings

import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/bookings/check-availability
 * @desc    Check equipment availability
 * @access  Public
 */
router.post('/check-availability', BookingController.checkAvailability);

/**
 * @route   GET /api/bookings/equipment/:equipmentId/calendar
 * @desc    Get equipment availability calendar
 * @access  Public
 */
router.get('/equipment/:equipmentId/calendar', BookingController.getCalendar);

/**
 * @route   POST /api/bookings
 * @desc    Create new booking
 * @access  Private (requires authentication)
 */
router.post('/', authenticate, BookingController.create);

/**
 * @route   GET /api/bookings/user/me
 * @desc    Get current user's bookings
 * @access  Private (requires authentication)
 */
router.get('/user/me', authenticate, BookingController.getMyBookings);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking by ID
 * @access  Private (requires authentication)
 */
router.get('/:id', authenticate, BookingController.getById);

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings
 * @access  Private (Admin only)
 */
router.get('/', authenticate, authorize('admin'), BookingController.getAll);

/**
 * @route   PATCH /api/bookings/:id/status
 * @desc    Update booking status
 * @access  Private (Admin only)
 */
router.patch('/:id/status', authenticate, authorize('admin'), BookingController.updateStatus);

/**
 * @route   POST /api/bookings/:id/cancel
 * @desc    Cancel booking
 * @access  Private (requires authentication)
 */
router.post('/:id/cancel', authenticate, BookingController.cancel);

export default router;
