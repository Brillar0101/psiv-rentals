// src/server.ts
// Main Express Server
// This is the entry point of our backend API

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import pool from './config/database';
import authRoutes from './routes/auth.routes';
import equipmentRoutes from './routes/equipment.routes';
import categoryRoutes from './routes/category.routes';
import bookingRoutes from './routes/booking.routes';
import paymentRoutes from './routes/payment.routes';
import cartRoutes from './routes/cart.routes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// =============================================
// MIDDLEWARE
// =============================================

// Security headers
app.use(helmet());

// CORS - Allow mobile app and frontend to access API
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// =============================================
// ROUTES
// =============================================

// Authentication routes
app.use('/api/auth', authRoutes);

// Equipment routes
app.use('/api/equipment', equipmentRoutes);

// Category routes
app.use('/api/categories', categoryRoutes);

// Booking routes
app.use('/api/bookings', bookingRoutes);

// Payment routes
app.use('/api/payment', paymentRoutes);

// Cart routes
app.use('/api/cart', cartRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'PSIV Rentals API is running! 🚀',
    timestamp: new Date().toISOString(),
  });
});

// Test database connection
app.get('/api/test-db', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      success: true,
      message: 'Database connection successful! ✅',
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
    });
  }
});

// =============================================
// ERROR HANDLING
// =============================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// =============================================
// START SERVER
// =============================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🎬 PSIV Rentals API Server Started! 🎬     ║
║                                               ║
║   Port: ${PORT}                                    ║
║   Environment: ${process.env.NODE_ENV || 'development'}              ║
║   Time: ${new Date().toLocaleString()}    ║
║                                               ║
╚═══════════════════════════════════════════════╝
  `);
});

export default app;