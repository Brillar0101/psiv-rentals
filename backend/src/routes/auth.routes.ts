// src/routes/auth.routes.ts
import { Router, Response } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { uploadSingleImage, handleMulterError } from '../middleware/upload';
import { S3Service } from '../services/s3.service';
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

    // Split full_name into first_name and last_name
    let first_name = '';
    let last_name = '';
    if (full_name) {
      const nameParts = full_name.trim().split(' ');
      first_name = nameParts[0] || '';
      last_name = nameParts.slice(1).join(' ') || '';
    }

    // Build update query - database has first_name and last_name columns
    let updateFields: string[] = [];
    let values: any[] = [];
    let paramCount = 1;

    if (first_name) {
      updateFields.push(`first_name = $${paramCount++}`);
      values.push(first_name);
    }

    if (last_name !== undefined) {
      updateFields.push(`last_name = $${paramCount++}`);
      values.push(last_name);
    }

    if (phone !== undefined) {
      updateFields.push(`phone = $${paramCount++}`);
      values.push(phone);
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(userId);

    const query = `
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, first_name, last_name, phone, role, created_at, updated_at
    `;

    const result = await pool.query(query, values);
    const user = result.rows[0];

    // Return combined full_name for the mobile app
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        ...user,
        full_name: `${user.first_name} ${user.last_name}`.trim(),
      },
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

// Upload profile picture
router.post('/profile/picture', authenticate, uploadSingleImage, handleMulterError, async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided',
      });
    }

    // Get current profile image to delete old one
    const currentUserResult = await pool.query(
      'SELECT profile_image_url FROM users WHERE id = $1',
      [userId]
    );
    const oldImageUrl = currentUserResult.rows[0]?.profile_image_url;

    // Upload new image to S3
    const key = S3Service.generateProfileImageKey(userId, file.originalname);
    const { url } = await S3Service.uploadFile(file.buffer, key, file.mimetype);

    // Update user profile with new image URL
    await pool.query(
      'UPDATE users SET profile_image_url = $1, updated_at = NOW() WHERE id = $2',
      [url, userId]
    );

    // Delete old image from S3 if exists
    if (oldImageUrl) {
      try {
        const oldKey = S3Service.extractKeyFromUrl(oldImageUrl);
        await S3Service.deleteFile(oldKey);
      } catch (deleteError) {
        console.error('Failed to delete old profile image:', deleteError);
      }
    }

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      data: { profile_image_url: url },
    });
  } catch (error: any) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete profile picture
router.delete('/profile/picture', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;

    // Get current profile image
    const currentUserResult = await pool.query(
      'SELECT profile_image_url FROM users WHERE id = $1',
      [userId]
    );
    const imageUrl = currentUserResult.rows[0]?.profile_image_url;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'No profile picture to delete',
      });
    }

    // Delete from S3
    const key = S3Service.extractKeyFromUrl(imageUrl);
    await S3Service.deleteFile(key);

    // Update user profile
    await pool.query(
      'UPDATE users SET profile_image_url = NULL, updated_at = NOW() WHERE id = $1',
      [userId]
    );

    res.json({
      success: true,
      message: 'Profile picture deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
