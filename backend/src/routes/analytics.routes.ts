// backend/src/routes/analytics.routes.ts
// Analytics Routes - Track user searches and behaviors

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import pool from '../config/database';

const router = Router();

/**
 * @route   POST /api/analytics/search
 * @desc    Log a search query (for understanding user demand)
 * @access  Public (but tracks user if logged in)
 */
router.post('/search', async (req, res) => {
  try {
    const { query, results_count, selected_item_id } = req.body;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Query must be at least 2 characters',
      });
    }

    // Get user ID from token if available
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch {
        // Token invalid, continue without user ID
      }
    }

    // Get IP and user agent for analytics
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || '';

    await pool.query(
      `INSERT INTO search_analytics
        (user_id, query, results_count, selected_item_id, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, query.trim().toLowerCase(), results_count || 0, selected_item_id, ipAddress, userAgent]
    );

    res.json({ success: true });
  } catch (error: any) {
    console.error('Log search error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/analytics/popular-searches
 * @desc    Get popular search terms (for suggestions)
 * @access  Public
 */
router.get('/popular-searches', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const result = await pool.query(
      `SELECT query, search_count
       FROM popular_searches
       LIMIT $1`,
      [parseInt(limit as string)]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('Get popular searches error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/analytics/zero-results
 * @desc    Get searches with zero results (Admin - understand demand)
 * @access  Private (Admin)
 */
router.get('/zero-results', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT query, search_count, unique_users, last_searched
       FROM zero_result_searches`
    );

    res.json({
      success: true,
      data: result.rows,
      message: 'These are searches where users found nothing - potential equipment to add!',
    });
  } catch (error: any) {
    console.error('Get zero results error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/analytics/search-stats
 * @desc    Get overall search statistics (Admin)
 * @access  Private (Admin)
 */
router.get('/search-stats', authenticate, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const stats = await pool.query(
      `SELECT
        COUNT(*) as total_searches,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT query) as unique_queries,
        AVG(results_count) as avg_results,
        COUNT(*) FILTER (WHERE results_count = 0) as zero_result_searches,
        COUNT(*) FILTER (WHERE selected_item_id IS NOT NULL) as searches_with_selection
       FROM search_analytics
       WHERE created_at > NOW() - INTERVAL '${parseInt(days as string)} days'`
    );

    const topSearches = await pool.query(
      `SELECT query, COUNT(*) as count
       FROM search_analytics
       WHERE created_at > NOW() - INTERVAL '${parseInt(days as string)} days'
       GROUP BY query
       ORDER BY count DESC
       LIMIT 10`
    );

    res.json({
      success: true,
      data: {
        overview: stats.rows[0],
        top_searches: topSearches.rows,
      },
    });
  } catch (error: any) {
    console.error('Get search stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
