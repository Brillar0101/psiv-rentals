// backend/src/routes/review.routes.ts
// Equipment Review Routes

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import pool from '../config/database';

const router = Router();

/**
 * @route   POST /api/reviews
 * @desc    Create or update a review
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { equipment_id, rating, review_text, is_anonymous } = req.body;

    if (!equipment_id || !rating) {
      return res.status(400).json({
        success: false,
        error: 'Equipment ID and rating are required',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5',
      });
    }

    // Upsert (insert or update)
    const result = await pool.query(
      `INSERT INTO equipment_reviews (equipment_id, user_id, rating, review_text, is_anonymous)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (equipment_id, user_id)
       DO UPDATE SET 
         rating = EXCLUDED.rating,
         review_text = EXCLUDED.review_text,
         is_anonymous = EXCLUDED.is_anonymous,
         updated_at = NOW()
       RETURNING *`,
      [equipment_id, userId, rating, review_text || null, is_anonymous || false]
    );

    res.json({
      success: true,
      message: 'Review submitted successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/reviews/equipment/:equipmentId
 * @desc    Get all reviews for an equipment
 * @access  Public
 */
router.get('/equipment/:equipmentId', async (req, res) => {
  try {
    const { equipmentId } = req.params;

    const result = await pool.query(
      `SELECT 
        r.*,
        CASE 
          WHEN r.is_anonymous THEN NULL
          ELSE json_build_object(
            'id', u.id,
            'full_name', u.full_name,
            'email', u.email
          )
        END as user
      FROM equipment_reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.equipment_id = $1
      ORDER BY r.created_at DESC`,
      [equipmentId]
    );

    // Get rating distribution
    const distribution = await pool.query(
      `SELECT rating, COUNT(*) as count
       FROM equipment_reviews
       WHERE equipment_id = $1
       GROUP BY rating
       ORDER BY rating DESC`,
      [equipmentId]
    );

    res.json({
      success: true,
      data: {
        reviews: result.rows,
        distribution: distribution.rows,
        total: result.rows.length,
      },
    });
  } catch (error: any) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/reviews/user/:userId
 * @desc    Get all reviews by a user
 * @access  Private
 */
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    // Only allow users to see their own reviews
    if (userId !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
      });
    }

    const result = await pool.query(
      `SELECT 
        r.*,
        json_build_object(
          'id', e.id,
          'name', e.name,
          'images', e.images
        ) as equipment
      FROM equipment_reviews r
      LEFT JOIN equipment e ON r.equipment_id = e.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM equipment_reviews WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
