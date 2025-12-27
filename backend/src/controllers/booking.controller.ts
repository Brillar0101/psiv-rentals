// src/controllers/booking.controller.ts
// Booking Controller - Handles booking operations

import { Request, Response } from 'express';
import { BookingModel } from '../models/booking.model';

/**
 * Booking Controller Class
 * Handles all booking-related operations
 */
export class BookingController {
  /**
   * POST /api/bookings/check-availability
   * Check if equipment is available for dates
   */
  static async checkAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { equipment_id, start_date, end_date } = req.body;

      if (!equipment_id || !start_date || !end_date) {
        res.status(400).json({
          success: false,
          error: 'Please provide equipment_id, start_date, and end_date',
        });
        return;
      }

      // Validate dates
      const start = new Date(start_date);
      const end = new Date(end_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) {
        res.status(400).json({
          success: false,
          error: 'Start date cannot be in the past',
        });
        return;
      }

      if (end < start) {
        res.status(400).json({
          success: false,
          error: 'End date must be after start date',
        });
        return;
      }

      const isAvailable = await BookingModel.checkAvailability(
        equipment_id,
        start_date,
        end_date
      );

      if (isAvailable) {
        // Also calculate pricing
        const pricing = await BookingModel.calculatePrice(
          equipment_id,
          start_date,
          end_date
        );

        res.json({
          success: true,
          available: true,
          message: 'Equipment is available! ✅',
          pricing,
        });
      } else {
        res.json({
          success: true,
          available: false,
          message: 'Equipment is not available for selected dates ❌',
        });
      }
    } catch (error: any) {
      console.error('Check availability error:', error);
      
      if (error.message === 'Equipment not found') {
        res.status(404).json({
          success: false,
          error: 'Equipment not found',
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to check availability',
      });
    }
  }

  /**
   * POST /api/bookings
   * Create new booking
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
        return;
      }

      const { equipment_id, start_date, end_date, notes } = req.body;

      if (!equipment_id || !start_date || !end_date) {
        res.status(400).json({
          success: false,
          error: 'Please provide equipment_id, start_date, and end_date',
        });
        return;
      }

      // Validate dates
      const start = new Date(start_date);
      const end = new Date(end_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) {
        res.status(400).json({
          success: false,
          error: 'Start date cannot be in the past',
        });
        return;
      }

      if (end < start) {
        res.status(400).json({
          success: false,
          error: 'End date must be after start date',
        });
        return;
      }

      const booking = await BookingModel.create({
        user_id: req.user.id,
        equipment_id,
        start_date,
        end_date,
        notes,
      });

      res.status(201).json({
        success: true,
        message: 'Booking created successfully! 🎉',
        data: booking,
      });
    } catch (error: any) {
      console.error('Create booking error:', error);

      if (error.message === 'Equipment not available for selected dates') {
        res.status(409).json({
          success: false,
          error: 'Equipment is not available for selected dates',
        });
        return;
      }

      if (error.message === 'Equipment not found') {
        res.status(404).json({
          success: false,
          error: 'Equipment not found',
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to create booking',
      });
    }
  }

  /**
   * GET /api/bookings/:id
   * Get booking by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const booking = await BookingModel.findById(id);

      if (!booking) {
        res.status(404).json({
          success: false,
          error: 'Booking not found',
        });
        return;
      }

      // Check if user owns this booking (or is admin)
      if (
        req.user &&
        req.user.id !== booking.user_id &&
        req.user.role !== 'admin'
      ) {
        res.status(403).json({
          success: false,
          error: 'Access denied',
        });
        return;
      }

      res.json({
        success: true,
        data: booking,
      });
    } catch (error) {
      console.error('Get booking error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch booking',
      });
    }
  }

  /**
   * GET /api/bookings/user/me
   * Get current user's bookings
   */
  static async getMyBookings(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
        return;
      }

      const { status } = req.query;

      const bookings = await BookingModel.getUserBookings(
        req.user.id,
        status as string
      );

      res.json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      console.error('Get user bookings error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch bookings',
      });
    }
  }

  /**
   * GET /api/bookings
   * Get all bookings (Admin only)
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { status, page, limit } = req.query;

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 50;
      const offset = (pageNum - 1) * limitNum;

      const result = await BookingModel.getAll(
        status as string,
        limitNum,
        offset
      );

      res.json({
        success: true,
        data: result.bookings,
        meta: {
          total: result.total,
          page: pageNum,
          limit: limitNum,
          total_pages: Math.ceil(result.total / limitNum),
        },
      });
    } catch (error) {
      console.error('Get all bookings error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch bookings',
      });
    }
  }

  /**
   * PATCH /api/bookings/:id/status
   * Update booking status (Admin only)
   */
  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({
          success: false,
          error: 'Please provide status',
        });
        return;
      }

      const validStatuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
        return;
      }

      const booking = await BookingModel.updateStatus(id, status);

      res.json({
        success: true,
        message: 'Booking status updated! ✅',
        data: booking,
      });
    } catch (error: any) {
      console.error('Update booking status error:', error);

      if (error.message === 'Booking not found') {
        res.status(404).json({
          success: false,
          error: 'Booking not found',
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update booking status',
      });
    }
  }

  /**
   * POST /api/bookings/:id/cancel
   * Cancel booking
   */
  static async cancel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const booking = await BookingModel.findById(id);

      if (!booking) {
        res.status(404).json({
          success: false,
          error: 'Booking not found',
        });
        return;
      }

      // Check if user owns this booking (or is admin)
      if (
        req.user &&
        req.user.id !== booking.user_id &&
        req.user.role !== 'admin'
      ) {
        res.status(403).json({
          success: false,
          error: 'Access denied',
        });
        return;
      }

      const cancelledBooking = await BookingModel.cancel(id, reason);

      res.json({
        success: true,
        message: 'Booking cancelled successfully! ✅',
        data: cancelledBooking,
      });
    } catch (error: any) {
      console.error('Cancel booking error:', error);

      if (error.message === 'Booking not found or cannot be cancelled') {
        res.status(400).json({
          success: false,
          error: 'Booking cannot be cancelled',
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to cancel booking',
      });
    }
  }

  /**
   * GET /api/bookings/equipment/:equipmentId/calendar
   * Get equipment availability calendar
   */
  static async getCalendar(req: Request, res: Response): Promise<void> {
    try {
      const { equipmentId } = req.params;
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        res.status(400).json({
          success: false,
          error: 'Please provide start_date and end_date',
        });
        return;
      }

      const calendar = await BookingModel.getAvailabilityCalendar(
        equipmentId,
        start_date as string,
        end_date as string
      );

      res.json({
        success: true,
        data: calendar,
      });
    } catch (error) {
      console.error('Get calendar error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch calendar',
      });
    }
  }
}
