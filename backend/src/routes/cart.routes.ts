// backend/src/routes/cart.routes.ts
// Cart API Routes

import express from 'express';
import pool from '../config/database';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get user's cart
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;

    const result = await pool.query(
      `SELECT 
        ci.id,
        ci.equipment_id,
        ci.quantity,
        ci.start_date,
        ci.end_date,
        ci.created_at,
        e.name,
        e.brand,
        e.daily_rate,
        e.weekly_rate,
        e.damage_deposit,
        e.images,
        -- Calculate rental days
        (ci.end_date - ci.start_date) as total_days,
        -- Calculate pricing
        CASE 
          WHEN (ci.end_date - ci.start_date) >= 7 
          THEN e.weekly_rate * ci.quantity * CEIL((ci.end_date - ci.start_date)::numeric / 7)
          ELSE e.daily_rate * ci.quantity * (ci.end_date - ci.start_date)
        END as subtotal
      FROM cart_items ci
      JOIN equipment e ON ci.equipment_id = e.id
      WHERE ci.user_id = $1
      ORDER BY ci.created_at DESC`,
      [userId]
    );

    // Calculate totals
    const items = result.rows;
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    const totalDeposit = items.reduce((sum, item) => sum + parseFloat(item.damage_deposit) * item.quantity, 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + totalDeposit + tax;

    res.json({
      success: true,
      data: {
        items,
        summary: {
          item_count: items.length,
          subtotal: parseFloat(subtotal.toFixed(2)),
          deposit: parseFloat(totalDeposit.toFixed(2)),
          tax: parseFloat(tax.toFixed(2)),
          total: parseFloat(total.toFixed(2)),
        },
      },
    });
  } catch (error: any) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add item to cart
router.post('/add', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { equipment_id, quantity, start_date, end_date } = req.body;

    // Validate input
    if (!equipment_id || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: equipment_id, start_date, end_date',
      });
    }

    // Check if equipment exists
    const equipmentCheck = await pool.query(
      'SELECT id, name FROM equipment WHERE id = $1',
      [equipment_id]
    );

    if (equipmentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Equipment not found',
      });
    }

    // Check if item already in cart with same dates
    const existingItem = await pool.query(
      `SELECT id, quantity FROM cart_items 
       WHERE user_id = $1 AND equipment_id = $2 
       AND start_date = $3 AND end_date = $4`,
      [userId, equipment_id, start_date, end_date]
    );

    let result;
    if (existingItem.rows.length > 0) {
      // Update quantity
      result = await pool.query(
        `UPDATE cart_items 
         SET quantity = quantity + $1
         WHERE id = $2
         RETURNING *`,
        [quantity || 1, existingItem.rows[0].id]
      );
    } else {
      // Insert new item
      result = await pool.query(
        `INSERT INTO cart_items (user_id, equipment_id, quantity, start_date, end_date)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, equipment_id, quantity || 1, start_date, end_date]
      );
    }

    res.json({
      success: true,
      message: 'Item added to cart',
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update cart item quantity
router.put('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be at least 1',
      });
    }

    const result = await pool.query(
      `UPDATE cart_items 
       SET quantity = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [quantity, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found',
      });
    }

    res.json({
      success: true,
      message: 'Cart item updated',
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove item from cart
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found',
      });
    }

    res.json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error: any) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clear entire cart
router.delete('/', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;

    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    res.json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error: any) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Checkout - Convert cart to bookings
router.post('/checkout', authenticate, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user?.id;
    const { payment_method_id } = req.body;

    await client.query('BEGIN');

    // Get all cart items
    const cartItems = await client.query(
      `SELECT ci.*, e.daily_rate, e.weekly_rate, e.damage_deposit
       FROM cart_items ci
       JOIN equipment e ON ci.equipment_id = e.id
       WHERE ci.user_id = $1`,
      [userId]
    );

    if (cartItems.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Cart is empty',
      });
    }

    // Create bookings for each cart item
    const bookings = [];
    for (const item of cartItems.rows) {
      const totalDays = item.end_date - item.start_date;
      const rentalAmount = totalDays >= 7
        ? item.weekly_rate * Math.ceil(totalDays / 7)
        : item.daily_rate * totalDays;
      
      const booking = await client.query(
        `INSERT INTO bookings 
         (user_id, equipment_id, start_date, end_date, total_amount, damage_deposit, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending')
         RETURNING *`,
        [userId, item.equipment_id, item.start_date, item.end_date, rentalAmount, item.damage_deposit]
      );
      
      bookings.push(booking.rows[0]);
    }

    // Clear cart after successful checkout
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Checkout successful',
      data: {
        bookings,
        booking_count: bookings.length,
      },
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Checkout error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

export default router;
