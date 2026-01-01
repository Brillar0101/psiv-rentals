// backend/src/routes/booking.routes.ts
// Booking Routes - Complete file

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import pool from '../config/database';

const router = Router();

/**
 * @route   GET /api/bookings/user
 * @desc    Get all bookings for authenticated user
 * @access  Private
 */
router.get('/user', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;

    const result = await pool.query(
      `SELECT 
        b.*,
        json_build_object(
          'id', e.id,
          'name', e.name,
          'brand', e.brand,
          'images', e.images,
          'daily_rate', e.daily_rate,
          'weekly_rate', e.weekly_rate
        ) as equipment
      FROM bookings b
      LEFT JOIN equipment e ON b.equipment_id = e.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/bookings/check-availability
 * @desc    Check if equipment is available for dates
 * @access  Private
 */
router.post('/check-availability', authenticate, async (req, res) => {
  try {
    const { equipment_id, start_date, end_date } = req.body;

    if (!equipment_id || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    // Check for overlapping bookings
    const conflicts = await pool.query(
      `SELECT id FROM bookings 
       WHERE equipment_id = $1 
       AND status NOT IN ('cancelled', 'completed')
       AND (
         (start_date <= $2 AND end_date >= $2) OR
         (start_date <= $3 AND end_date >= $3) OR
         (start_date >= $2 AND end_date <= $3)
       )`,
      [equipment_id, start_date, end_date]
    );

    if (conflicts.rows.length > 0) {
      return res.json({
        success: true,
        available: false,
        message: 'Equipment is not available for selected dates',
      });
    }

    // Get equipment pricing
    const equipmentResult = await pool.query(
      'SELECT daily_rate, weekly_rate, damage_deposit FROM equipment WHERE id = $1',
      [equipment_id]
    );

    if (equipmentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Equipment not found',
      });
    }

    const equipment = equipmentResult.rows[0];
    const days = Math.ceil((new Date(end_date).getTime() - new Date(start_date).getTime()) / (1000 * 60 * 60 * 24));
    
    let rentalAmount;
    if (days >= 7) {
      const weeks = Math.ceil(days / 7);
      rentalAmount = equipment.weekly_rate * weeks;
    } else {
      rentalAmount = equipment.daily_rate * days;
    }

    const tax = rentalAmount * 0.08;
    const total = rentalAmount + tax + equipment.damage_deposit;

    res.json({
      success: true,
      available: true,
      pricing: {
        days,
        daily_rate: equipment.daily_rate,
        weekly_rate: equipment.weekly_rate,
        rental_amount: parseFloat(rentalAmount.toFixed(2)),
        damage_deposit: parseFloat(equipment.damage_deposit),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
      },
    });
  } catch (error: any) {
    console.error('Check availability error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { equipment_id, start_date, end_date, total_amount, damage_deposit } = req.body;

    const result = await pool.query(
      `INSERT INTO bookings (user_id, equipment_id, start_date, end_date, total_amount, damage_deposit, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [userId, equipment_id, start_date, end_date, total_amount, damage_deposit]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking by ID
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        b.*,
        json_build_object(
          'id', e.id,
          'name', e.name,
          'brand', e.brand,
          'images', e.images
        ) as equipment
      FROM bookings b
      LEFT JOIN equipment e ON b.equipment_id = e.id
      WHERE b.id = $1 AND b.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Get booking error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   PUT /api/bookings/:id/cancel
 * @desc    Cancel a booking
 * @access  Private
 */
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE bookings 
       SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND status = 'pending'
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found or cannot be cancelled',
      });
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
