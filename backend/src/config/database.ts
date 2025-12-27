// src/config/database.ts
// PostgreSQL Database Connection Configuration
// This file creates a connection pool to efficiently manage database connections

import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create PostgreSQL connection pool
// DSA Concept: Connection Pooling - Reuses connections instead of creating new ones (efficient resource management)
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'psiv_rentals',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum 20 connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Fail if connection takes more than 2 seconds
});

// Event: Successful connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

// Event: Connection error
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// Helper function to execute queries
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Export the pool for use in other files
export default pool;
