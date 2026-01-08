// backend/src/routes/promo.routes.ts
// Promo Codes and Credits API

import express from 'express';
import pool from '../config/database';
import { authenticate } from '../middleware/auth';
import crypto from 'crypto';

const router = express.Router();

// ============================================
// PROMO CODE ENDPOINTS
// ============================================

/**
 * @route   POST /api/promo/validate
 * @desc    Validate a promo code and get discount info
 * @access  Private
 */
router.post('/validate', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { code, order_total = 0 } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Promo code is required',
      });
    }

    // Find the promo code
    const promoResult = await pool.query(
      `SELECT * FROM promo_codes
       WHERE UPPER(code) = UPPER($1) AND is_active = TRUE`,
      [code.trim()]
    );

    if (promoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invalid promo code',
      });
    }

    const promo = promoResult.rows[0];

    // Check if expired
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'This promo code has expired',
      });
    }

    // Check if not yet started
    if (promo.starts_at && new Date(promo.starts_at) > new Date()) {
      return res.status(400).json({
        success: false,
        error: 'This promo code is not yet active',
      });
    }

    // Check max uses
    if (promo.max_uses && promo.current_uses >= promo.max_uses) {
      return res.status(400).json({
        success: false,
        error: 'This promo code has reached its usage limit',
      });
    }

    // Check user's usage
    const userUsageResult = await pool.query(
      `SELECT COUNT(*) as use_count FROM promo_code_uses
       WHERE promo_code_id = $1 AND user_id = $2`,
      [promo.id, userId]
    );

    const userUseCount = parseInt(userUsageResult.rows[0].use_count);
    if (promo.max_uses_per_user && userUseCount >= promo.max_uses_per_user) {
      return res.status(400).json({
        success: false,
        error: 'You have already used this promo code',
      });
    }

    // Check minimum order amount
    if (promo.min_order_amount && order_total < parseFloat(promo.min_order_amount)) {
      return res.status(400).json({
        success: false,
        error: `Minimum order of $${promo.min_order_amount} required for this code`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    let creditAmount = 0;

    if (promo.discount_type === 'percentage') {
      discountAmount = (order_total * parseFloat(promo.discount_value)) / 100;
      // Apply max discount cap if set
      if (promo.max_discount && discountAmount > parseFloat(promo.max_discount)) {
        discountAmount = parseFloat(promo.max_discount);
      }
    } else if (promo.discount_type === 'fixed_amount') {
      discountAmount = Math.min(parseFloat(promo.discount_value), order_total);
    } else if (promo.discount_type === 'credit') {
      // Credit type: applies to order, remainder goes to wallet
      creditAmount = parseFloat(promo.discount_value);
      discountAmount = Math.min(creditAmount, order_total);
    }

    res.json({
      success: true,
      data: {
        code: promo.code,
        description: promo.description,
        discount_type: promo.discount_type,
        discount_value: parseFloat(promo.discount_value),
        discount_amount: parseFloat(discountAmount.toFixed(2)),
        credit_to_wallet: promo.discount_type === 'credit'
          ? parseFloat((creditAmount - discountAmount).toFixed(2))
          : 0,
        min_order_amount: parseFloat(promo.min_order_amount || 0),
        valid: true,
      },
    });
  } catch (error: any) {
    console.error('Validate promo error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/promo/apply
 * @desc    Apply a promo code to a booking/order
 * @access  Private
 */
router.post('/apply', authenticate, async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = req.user?.id;
    const { code, order_total, booking_id } = req.body;

    if (!code || order_total === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Code and order_total are required',
      });
    }

    await client.query('BEGIN');

    // Find and lock the promo code
    const promoResult = await client.query(
      `SELECT * FROM promo_codes
       WHERE UPPER(code) = UPPER($1) AND is_active = TRUE
       FOR UPDATE`,
      [code.trim()]
    );

    if (promoResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Invalid promo code',
      });
    }

    const promo = promoResult.rows[0];

    // Validate (same checks as /validate)
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'This promo code has expired' });
    }

    if (promo.max_uses && promo.current_uses >= promo.max_uses) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'This promo code has reached its usage limit' });
    }

    const userUsageResult = await client.query(
      `SELECT COUNT(*) as use_count FROM promo_code_uses
       WHERE promo_code_id = $1 AND user_id = $2`,
      [promo.id, userId]
    );

    if (promo.max_uses_per_user && parseInt(userUsageResult.rows[0].use_count) >= promo.max_uses_per_user) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'You have already used this promo code' });
    }

    if (promo.min_order_amount && order_total < parseFloat(promo.min_order_amount)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: `Minimum order of $${promo.min_order_amount} required`
      });
    }

    // Calculate discount
    let discountAmount = 0;
    let creditToWallet = 0;

    if (promo.discount_type === 'percentage') {
      discountAmount = (order_total * parseFloat(promo.discount_value)) / 100;
      if (promo.max_discount && discountAmount > parseFloat(promo.max_discount)) {
        discountAmount = parseFloat(promo.max_discount);
      }
    } else if (promo.discount_type === 'fixed_amount') {
      discountAmount = Math.min(parseFloat(promo.discount_value), order_total);
    } else if (promo.discount_type === 'credit') {
      const creditValue = parseFloat(promo.discount_value);
      discountAmount = Math.min(creditValue, order_total);
      creditToWallet = creditValue - discountAmount;
    }

    // Record promo code usage
    await client.query(
      `INSERT INTO promo_code_uses (promo_code_id, user_id, booking_id, discount_applied, credit_added)
       VALUES ($1, $2, $3, $4, $5)`,
      [promo.id, userId, booking_id, discountAmount, creditToWallet]
    );

    // Increment usage count
    await client.query(
      `UPDATE promo_codes SET current_uses = current_uses + 1, updated_at = NOW() WHERE id = $1`,
      [promo.id]
    );

    // If there's credit to add to wallet
    if (creditToWallet > 0) {
      // Get or create user credit record
      const creditResult = await client.query(
        `INSERT INTO user_credits (user_id, balance, total_earned)
         VALUES ($1, $2, $2)
         ON CONFLICT (user_id) DO UPDATE SET
           balance = user_credits.balance + $2,
           total_earned = user_credits.total_earned + $2,
           updated_at = NOW()
         RETURNING *`,
        [userId, creditToWallet]
      );

      // Record transaction
      await client.query(
        `INSERT INTO credit_transactions
         (user_id, transaction_type, amount, balance_after, reference_id, reference_type, description)
         VALUES ($1, 'promo_code', $2, $3, $4, 'promo_code', $5)`,
        [
          userId,
          creditToWallet,
          creditResult.rows[0].balance,
          promo.id,
          `Credit from promo code ${promo.code}`
        ]
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      data: {
        code: promo.code,
        discount_applied: parseFloat(discountAmount.toFixed(2)),
        credit_added: parseFloat(creditToWallet.toFixed(2)),
        new_total: parseFloat((order_total - discountAmount).toFixed(2)),
        message: creditToWallet > 0
          ? `$${discountAmount.toFixed(2)} applied to order, $${creditToWallet.toFixed(2)} added to your wallet!`
          : `$${discountAmount.toFixed(2)} discount applied!`,
      },
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Apply promo error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

// ============================================
// USER CREDIT/WALLET ENDPOINTS
// ============================================

/**
 * @route   GET /api/promo/credits
 * @desc    Get user's credit balance and history
 * @access  Private
 */
router.get('/credits', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;

    // Get or create credit record
    const creditResult = await pool.query(
      `INSERT INTO user_credits (user_id, balance)
       VALUES ($1, 0)
       ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
       RETURNING *`,
      [userId]
    );

    // Get recent transactions
    const transactionsResult = await pool.query(
      `SELECT * FROM credit_transactions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        balance: parseFloat(creditResult.rows[0].balance),
        total_earned: parseFloat(creditResult.rows[0].total_earned || 0),
        total_spent: parseFloat(creditResult.rows[0].total_spent || 0),
        transactions: transactionsResult.rows,
      },
    });
  } catch (error: any) {
    console.error('Get credits error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/promo/credits/use
 * @desc    Use credits for a booking
 * @access  Private
 */
router.post('/credits/use', authenticate, async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = req.user?.id;
    const { amount, booking_id } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid credit amount',
      });
    }

    await client.query('BEGIN');

    // Get current balance with lock
    const creditResult = await client.query(
      `SELECT * FROM user_credits WHERE user_id = $1 FOR UPDATE`,
      [userId]
    );

    if (creditResult.rows.length === 0 || parseFloat(creditResult.rows[0].balance) < amount) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Insufficient credit balance',
      });
    }

    const currentBalance = parseFloat(creditResult.rows[0].balance);
    const newBalance = currentBalance - amount;

    // Update balance
    await client.query(
      `UPDATE user_credits
       SET balance = $1, total_spent = total_spent + $2, updated_at = NOW()
       WHERE user_id = $3`,
      [newBalance, amount, userId]
    );

    // Record transaction
    await client.query(
      `INSERT INTO credit_transactions
       (user_id, transaction_type, amount, balance_after, reference_id, reference_type, description)
       VALUES ($1, 'booking_payment', $2, $3, $4, 'booking', $5)`,
      [userId, -amount, newBalance, booking_id, 'Credit used for booking payment']
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      data: {
        amount_used: parseFloat(amount.toFixed(2)),
        new_balance: parseFloat(newBalance.toFixed(2)),
      },
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Use credits error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * @route   GET /api/promo/admin/codes
 * @desc    Get all promo codes (Admin)
 * @access  Private (Admin)
 */
router.get('/admin/codes', authenticate, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const result = await pool.query(
      `SELECT
        pc.*,
        u.email as created_by_email,
        (SELECT COUNT(*) FROM promo_code_uses WHERE promo_code_id = pc.id) as times_used,
        (SELECT SUM(discount_applied) FROM promo_code_uses WHERE promo_code_id = pc.id) as total_discounted
       FROM promo_codes pc
       LEFT JOIN users u ON pc.created_by = u.id
       ORDER BY pc.created_at DESC`
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Get promo codes error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/promo/admin/create
 * @desc    Create a new promo code (Admin)
 * @access  Private (Admin)
 */
router.post('/admin/create', authenticate, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const {
      code,
      description,
      discount_type = 'fixed_amount',
      discount_value,
      min_order_amount = 0,
      max_discount,
      max_uses,
      max_uses_per_user = 1,
      expires_at,
    } = req.body;

    // Validate required fields
    if (!code || !discount_value) {
      return res.status(400).json({
        success: false,
        error: 'Code and discount_value are required',
      });
    }

    // Validate discount type
    if (!['percentage', 'fixed_amount', 'credit'].includes(discount_type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid discount_type. Must be: percentage, fixed_amount, or credit',
      });
    }

    // Check if code already exists
    const existingCode = await pool.query(
      'SELECT id FROM promo_codes WHERE UPPER(code) = UPPER($1)',
      [code]
    );

    if (existingCode.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'A promo code with this name already exists',
      });
    }

    const result = await pool.query(
      `INSERT INTO promo_codes
       (code, description, discount_type, discount_value, min_order_amount,
        max_discount, max_uses, max_uses_per_user, expires_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        code.toUpperCase(),
        description,
        discount_type,
        discount_value,
        min_order_amount,
        max_discount,
        max_uses,
        max_uses_per_user,
        expires_at,
        req.user.id,
      ]
    );

    res.json({
      success: true,
      message: 'Promo code created successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Create promo code error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/promo/admin/generate
 * @desc    Generate a unique promo code (Admin)
 * @access  Private (Admin)
 */
router.post('/admin/generate', authenticate, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const {
      prefix = 'PSIV',
      description,
      discount_type = 'credit',
      discount_value,
      max_uses = 1,
      max_uses_per_user = 1,
      expires_in_days = 365,
    } = req.body;

    if (!discount_value) {
      return res.status(400).json({
        success: false,
        error: 'discount_value is required',
      });
    }

    // Generate unique code
    const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
    const code = `${prefix}${randomPart}`;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expires_in_days);

    const result = await pool.query(
      `INSERT INTO promo_codes
       (code, description, discount_type, discount_value, max_uses, max_uses_per_user, expires_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        code,
        description || `Generated ${discount_type} code - $${discount_value}`,
        discount_type,
        discount_value,
        max_uses,
        max_uses_per_user,
        expiresAt,
        req.user.id,
      ]
    );

    res.json({
      success: true,
      message: 'Promo code generated successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Generate promo code error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   PUT /api/promo/admin/:id
 * @desc    Update a promo code (Admin)
 * @access  Private (Admin)
 */
router.put('/admin/:id', authenticate, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const { id } = req.params;
    const { is_active, expires_at, max_uses, description } = req.body;

    const result = await pool.query(
      `UPDATE promo_codes
       SET is_active = COALESCE($1, is_active),
           expires_at = COALESCE($2, expires_at),
           max_uses = COALESCE($3, max_uses),
           description = COALESCE($4, description),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [is_active, expires_at, max_uses, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Promo code not found',
      });
    }

    res.json({
      success: true,
      message: 'Promo code updated',
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Update promo code error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   PATCH /api/promo/admin/codes/:id/deactivate
 * @desc    Deactivate a promo code (Admin)
 * @access  Private (Admin)
 */
router.patch('/admin/codes/:id/deactivate', authenticate, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const { id } = req.params;

    const result = await pool.query(
      `UPDATE promo_codes SET is_active = FALSE, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Promo code not found',
      });
    }

    res.json({
      success: true,
      message: 'Promo code deactivated',
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Deactivate promo code error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/promo/admin/:id
 * @desc    Delete/deactivate a promo code (Admin)
 * @access  Private (Admin)
 */
router.delete('/admin/:id', authenticate, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const { id } = req.params;

    // Soft delete - just deactivate
    const result = await pool.query(
      `UPDATE promo_codes SET is_active = FALSE, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Promo code not found',
      });
    }

    res.json({
      success: true,
      message: 'Promo code deactivated',
    });
  } catch (error: any) {
    console.error('Delete promo code error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/promo/admin/add-credit
 * @desc    Manually add credit to a user (Admin)
 * @access  Private (Admin)
 */
router.post('/admin/add-credit', authenticate, async (req, res) => {
  const client = await pool.connect();

  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const { user_id, amount, description } = req.body;

    if (!user_id || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'user_id and positive amount are required',
      });
    }

    await client.query('BEGIN');

    // Get or create and update credit
    const creditResult = await client.query(
      `INSERT INTO user_credits (user_id, balance, total_earned)
       VALUES ($1, $2, $2)
       ON CONFLICT (user_id) DO UPDATE SET
         balance = user_credits.balance + $2,
         total_earned = user_credits.total_earned + $2,
         updated_at = NOW()
       RETURNING *`,
      [user_id, amount]
    );

    // Record transaction
    await client.query(
      `INSERT INTO credit_transactions
       (user_id, transaction_type, amount, balance_after, description)
       VALUES ($1, 'admin_adjustment', $2, $3, $4)`,
      [user_id, amount, creditResult.rows[0].balance, description || 'Admin credit adjustment']
    );

    await client.query('COMMIT');

    // Get user info
    const userResult = await pool.query(
      'SELECT email, first_name, last_name FROM users WHERE id = $1',
      [user_id]
    );

    res.json({
      success: true,
      message: `$${amount} credit added successfully`,
      data: {
        user: userResult.rows[0],
        new_balance: parseFloat(creditResult.rows[0].balance),
      },
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Add credit error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

export default router;
