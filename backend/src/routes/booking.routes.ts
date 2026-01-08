// backend/src/routes/booking.routes.ts
// Booking Routes - Complete file

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import pool from '../config/database';

const router = Router();

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings (Admin dashboard)
 * @access  Private (Admin)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, page, limit } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;
    const offset = (pageNum - 1) * limitNum;

    let query = `
      SELECT
        b.*,
        u.first_name,
        u.last_name,
        u.email,
        e.name as equipment_name,
        e.brand as equipment_brand,
        e.images as equipment_images
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN equipment e ON b.equipment_id = e.id
    `;

    const params: any[] = [];

    if (status) {
      params.push(status);
      query += ` WHERE b.status = $${params.length}`;
    }

    query += ` ORDER BY b.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limitNum, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM bookings';
    const countParams: any[] = [];
    if (status) {
      countParams.push(status);
      countQuery += ` WHERE status = $1`;
    }
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

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
        e.name as equipment_name,
        e.brand as equipment_brand,
        e.images as equipment_images,
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
 * @desc    Check if equipment is available for dates and has stock
 * @access  Private
 */
router.post('/check-availability', authenticate, async (req, res) => {
  try {
    const { equipment_id, start_date, end_date, quantity = 1 } = req.body;

    if (!equipment_id || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    // First, get equipment details including quantity
    const equipmentResult = await pool.query(
      `SELECT id, name, daily_rate, weekly_rate, damage_deposit,
              quantity_total, quantity_available, is_active
       FROM equipment WHERE id = $1`,
      [equipment_id]
    );

    if (equipmentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Equipment not found',
      });
    }

    const equipment = equipmentResult.rows[0];

    // Check if equipment is active
    if (!equipment.is_active) {
      return res.json({
        success: true,
        available: false,
        message: 'This equipment is currently not available for rent',
      });
    }

    // Check if there's enough quantity available
    if (equipment.quantity_available < quantity) {
      return res.json({
        success: true,
        available: false,
        message: `Only ${equipment.quantity_available} unit(s) available. You requested ${quantity}.`,
        quantity_available: equipment.quantity_available,
      });
    }

    // Check for overlapping bookings that would reduce availability
    const conflicts = await pool.query(
      `SELECT COUNT(*) as booked_count FROM bookings
       WHERE equipment_id = $1
       AND status NOT IN ('cancelled', 'completed')
       AND (
         (start_date <= $2 AND end_date >= $2) OR
         (start_date <= $3 AND end_date >= $3) OR
         (start_date >= $2 AND end_date <= $3)
       )`,
      [equipment_id, start_date, end_date]
    );

    const bookedCount = parseInt(conflicts.rows[0].booked_count) || 0;
    const availableForDates = equipment.quantity_total - bookedCount;

    if (availableForDates < quantity) {
      return res.json({
        success: true,
        available: false,
        message: availableForDates > 0
          ? `Only ${availableForDates} unit(s) available for selected dates`
          : 'Equipment is fully booked for selected dates',
        quantity_available: availableForDates,
      });
    }

    // Calculate pricing (damage deposit NOT included - only charged if equipment is damaged)
    const days = Math.ceil((new Date(end_date).getTime() - new Date(start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;

    let rentalAmount;
    if (days >= 7 && equipment.weekly_rate) {
      const weeks = Math.ceil(days / 7);
      rentalAmount = equipment.weekly_rate * weeks * quantity;
    } else {
      rentalAmount = equipment.daily_rate * days * quantity;
    }

    const tax = rentalAmount * 0.08;
    // Total does NOT include damage deposit - it's only charged if equipment is returned damaged
    const total = rentalAmount + tax;

    res.json({
      success: true,
      available: true,
      message: 'Equipment is available',
      quantity_available: availableForDates,
      pricing: {
        days,
        quantity,
        daily_rate: parseFloat(equipment.daily_rate),
        weekly_rate: equipment.weekly_rate ? parseFloat(equipment.weekly_rate) : null,
        rental_amount: parseFloat(rentalAmount.toFixed(2)),
        damage_deposit: 0, // Not charged upfront - only if equipment is damaged
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
    const { equipment_id, start_date, end_date, total_amount, damage_deposit, payment_status } = req.body;

    if (!equipment_id || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: equipment_id, start_date, end_date',
      });
    }

    // Get equipment details for daily_rate
    const equipmentResult = await pool.query(
      'SELECT daily_rate FROM equipment WHERE id = $1',
      [equipment_id]
    );

    if (equipmentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Equipment not found',
      });
    }

    const dailyRate = parseFloat(equipmentResult.rows[0].daily_rate);

    // Calculate days and subtotal
    const startDateObj = new Date(start_date);
    const endDateObj = new Date(end_date);
    const totalDays = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const subtotal = dailyRate * totalDays;
    const tax = subtotal * 0.08;
    const finalTotal = total_amount !== undefined ? total_amount : (subtotal + tax);
    const finalDeposit = damage_deposit !== undefined ? damage_deposit : 0;
    const finalPaymentStatus = payment_status || 'pending';
    // Set status to 'confirmed' if payment is already complete, otherwise 'pending'
    const finalStatus = finalPaymentStatus === 'paid' ? 'confirmed' : 'pending';

    console.log('Creating booking with:', {
      userId,
      equipment_id,
      start_date,
      end_date,
      dailyRate,
      totalDays,
      subtotal,
      tax,
      finalDeposit,
      finalTotal,
      finalPaymentStatus,
      finalStatus,
    });

    const result = await pool.query(
      `INSERT INTO bookings (user_id, equipment_id, start_date, end_date, daily_rate, total_days, subtotal, tax, damage_deposit, total_amount, status, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [userId, equipment_id, start_date, end_date, dailyRate, totalDays, subtotal, tax, finalDeposit, finalTotal, finalStatus, finalPaymentStatus]
    );

    console.log('Booking created successfully:', result.rows[0]?.id);

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Create booking error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
    });
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

// =============================================
// ADMIN BOOKING MANAGEMENT ROUTES
// =============================================

/**
 * @route   PATCH /api/bookings/:id/status
 * @desc    Update booking status (Admin)
 * @access  Private (Admin)
 */
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const result = await pool.query(
      `UPDATE bookings
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    res.json({
      success: true,
      message: 'Booking status updated',
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/bookings/:id/admin-cancel
 * @desc    Admin cancel booking with reason
 * @access  Private (Admin)
 */
router.post('/:id/admin-cancel', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await pool.query(
      `UPDATE bookings
       SET status = 'cancelled',
           cancellation_reason = $1,
           cancelled_at = NOW(),
           cancelled_by = $2,
           updated_at = NOW()
       WHERE id = $3 AND status NOT IN ('completed')
       RETURNING *`,
      [reason || 'Cancelled by admin', req.user?.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found or cannot be cancelled',
      });
    }

    res.json({
      success: true,
      message: 'Booking cancelled by admin',
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Admin cancel error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/bookings/:id/reactivate
 * @desc    Reactivate a cancelled booking (Admin)
 * @access  Private (Admin)
 */
router.post('/:id/reactivate', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { new_status } = req.body;

    // First check if booking exists and is cancelled
    const checkResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    const booking = checkResult.rows[0];
    if (booking.status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Only cancelled bookings can be reactivated',
      });
    }

    const result = await pool.query(
      `UPDATE bookings
       SET status = $1,
           cancellation_reason = NULL,
           cancelled_at = NULL,
           cancelled_by = NULL,
           reactivated_at = NOW(),
           reactivated_by = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [new_status || 'pending', req.user?.id, id]
    );

    res.json({
      success: true,
      message: 'Booking reactivated successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Reactivate booking error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   PATCH /api/bookings/:id/extend
 * @desc    Extend booking dates (Admin)
 * @access  Private (Admin)
 */
router.patch('/:id/extend', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { new_end_date, reason } = req.body;

    if (!new_end_date) {
      return res.status(400).json({
        success: false,
        error: 'Please provide new_end_date',
      });
    }

    // Get current booking
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    const booking = bookingResult.rows[0];
    const oldEndDate = booking.end_date;
    const newEnd = new Date(new_end_date);

    if (newEnd <= new Date(oldEndDate)) {
      return res.status(400).json({
        success: false,
        error: 'New end date must be after current end date',
      });
    }

    // Get equipment pricing
    const equipmentResult = await pool.query(
      'SELECT daily_rate, weekly_rate FROM equipment WHERE id = $1',
      [booking.equipment_id]
    );

    const equipment = equipmentResult.rows[0];

    // Calculate new totals
    const startDate = new Date(booking.start_date);
    const diffTime = Math.abs(newEnd.getTime() - startDate.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    let subtotal;
    if (equipment.weekly_rate && totalDays >= 7) {
      const weeks = Math.floor(totalDays / 7);
      const remainingDays = totalDays % 7;
      subtotal = (weeks * equipment.weekly_rate) + (remainingDays * equipment.daily_rate);
    } else {
      subtotal = totalDays * equipment.daily_rate;
    }

    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const totalAmount = parseFloat((subtotal + tax + parseFloat(booking.damage_deposit)).toFixed(2));

    const result = await pool.query(
      `UPDATE bookings
       SET end_date = $1,
           total_days = $2,
           subtotal = $3,
           tax = $4,
           total_amount = $5,
           extension_reason = $6,
           extended_by = $7,
           extended_at = NOW(),
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [new_end_date, totalDays, subtotal, tax, totalAmount, reason || null, req.user?.id, id]
    );

    res.json({
      success: true,
      message: 'Booking extended successfully',
      data: result.rows[0],
      changes: {
        old_end_date: oldEndDate,
        new_end_date: new_end_date,
        old_total_days: booking.total_days,
        new_total_days: totalDays,
        old_total_amount: booking.total_amount,
        new_total_amount: totalAmount,
      },
    });
  } catch (error: any) {
    console.error('Extend booking error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   PATCH /api/bookings/:id/notes
 * @desc    Add/Update admin notes on booking (Admin)
 * @access  Private (Admin)
 */
router.patch('/:id/notes', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;

    const result = await pool.query(
      `UPDATE bookings
       SET admin_notes = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [admin_notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    res.json({
      success: true,
      message: 'Admin notes updated',
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Update notes error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   PATCH /api/bookings/:id/payment-status
 * @desc    Update payment status (Admin)
 * @access  Private (Admin)
 */
router.patch('/:id/payment-status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    const validStatuses = ['pending', 'paid', 'refunded', 'partial_refund'];
    if (!validStatuses.includes(payment_status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid payment status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const result = await pool.query(
      `UPDATE bookings
       SET payment_status = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [payment_status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    res.json({
      success: true,
      message: 'Payment status updated',
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Update payment status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/bookings/:id/details
 * @desc    Get full booking details (Admin)
 * @access  Private (Admin)
 */
router.get('/:id/details', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        b.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        e.name as equipment_name,
        e.brand as equipment_brand,
        e.model as equipment_model,
        e.images as equipment_images,
        e.daily_rate as current_daily_rate,
        e.weekly_rate as current_weekly_rate,
        c.name as category_name,
        cancelled_user.first_name as cancelled_by_name,
        extended_user.first_name as extended_by_name,
        reactivated_user.first_name as reactivated_by_name
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN equipment e ON b.equipment_id = e.id
      LEFT JOIN equipment_categories c ON e.category_id = c.id
      LEFT JOIN users cancelled_user ON b.cancelled_by = cancelled_user.id
      LEFT JOIN users extended_user ON b.extended_by = extended_user.id
      LEFT JOIN users reactivated_user ON b.reactivated_by = reactivated_user.id
      WHERE b.id = $1`,
      [id]
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
    console.error('Get booking details error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
