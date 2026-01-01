// src/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import pool from '../config/database';

const router = Router();

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.get('/me', authenticate, AuthController.getProfile);

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { full_name, phone, address, city, state, zip_code, country } = req.body;

    // First, check what columns exist in the users table
    const columnCheck = await pool.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'users'`
    );
    
    const columns = columnCheck.rows.map(row => row.column_name);
    console.log('Available columns:', columns);

    // Build update query based on available columns
    let updateFields: string[] = [];
    let values: any[] = [];
    let paramCount = 1;

    // Check which column name exists: full_name, fullname, or name
    if (columns.includes('full_name')) {
      updateFields.push(`full_name = $${paramCount++}`);
      values.push(full_name);
    } else if (columns.includes('fullname')) {
      updateFields.push(`fullname = $${paramCount++}`);
      values.push(full_name);
    } else if (columns.includes('name')) {
      updateFields.push(`name = $${paramCount++}`);
      values.push(full_name);
    }

    if (columns.includes('phone')) {
      updateFields.push(`phone = $${paramCount++}`);
      values.push(phone);
    }

    if (columns.includes('address')) {
      updateFields.push(`address = $${paramCount++}`);
      values.push(address);
    }

    if (columns.includes('city')) {
      updateFields.push(`city = $${paramCount++}`);
      values.push(city);
    }

    if (columns.includes('state')) {
      updateFields.push(`state = $${paramCount++}`);
      values.push(state);
    }

    if (columns.includes('zip_code')) {
      updateFields.push(`zip_code = $${paramCount++}`);
      values.push(zip_code);
    } else if (columns.includes('zipcode')) {
      updateFields.push(`zipcode = $${paramCount++}`);
      values.push(zip_code);
    } else if (columns.includes('zip')) {
      updateFields.push(`zip = $${paramCount++}`);
      values.push(zip_code);
    }

    if (columns.includes('country')) {
      updateFields.push(`country = $${paramCount++}`);
      values.push(country);
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(userId);

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Change password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required',
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters',
      });
    }

    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const bcrypt = require('bcrypt');
    const isMatch = await bcrypt.compare(current_password, userResult.rows[0].password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect',
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
