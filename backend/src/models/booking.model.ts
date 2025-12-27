// src/models/booking.model.ts
// Booking Model - Database operations for bookings
// DSA: Date range queries for O(log n) availability checking using indexes

import pool from '../config/database';

export interface Booking {
  id: string;
  user_id: string;
  equipment_id: string;
  start_date: Date;
  end_date: Date;
  total_days: number;
  daily_rate: number;
  subtotal: number;
  damage_deposit: number;
  tax: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  stripe_payment_id?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBookingDTO {
  user_id: string;
  equipment_id: string;
  start_date: string;
  end_date: string;
  notes?: string;
}

/**
 * Booking Model Class
 * Handles all database operations for bookings
 */
export class BookingModel {
  /**
   * Check equipment availability for date range
   * DSA: Uses indexed date range query for O(log n) performance
   * 
   * @param equipmentId Equipment to check
   * @param startDate Start date
   * @param endDate End date
   * @returns true if available, false if booked
   */
  static async checkAvailability(
    equipmentId: string,
    startDate: string,
    endDate: string
  ): Promise<boolean> {
    // Check for overlapping bookings
    // DSA: Range query optimization using B-tree index on dates
    const query = `
      SELECT COUNT(*) as conflict_count
      FROM bookings
      WHERE equipment_id = $1
        AND status NOT IN ('cancelled', 'completed')
        AND (
          (start_date <= $2 AND end_date >= $2) OR
          (start_date <= $3 AND end_date >= $3) OR
          (start_date >= $2 AND end_date <= $3)
        )
    `;

    const result = await pool.query(query, [equipmentId, startDate, endDate]);
    const conflictCount = parseInt(result.rows[0].conflict_count);

    if (conflictCount > 0) {
      return false; // Equipment is booked
    }

    // Check if equipment exists and is available
    const equipmentQuery = `
      SELECT quantity_available, is_active
      FROM equipment
      WHERE id = $1
    `;
    const equipmentResult = await pool.query(equipmentQuery, [equipmentId]);

    if (equipmentResult.rows.length === 0) {
      throw new Error('Equipment not found');
    }

    const equipment = equipmentResult.rows[0];
    
    if (!equipment.is_active || equipment.quantity_available <= 0) {
      return false;
    }

    return true;
  }

  /**
   * Calculate booking price
   * DSA: Dynamic programming approach for optimal pricing
   * 
   * @param equipmentId Equipment ID
   * @param startDate Start date
   * @param endDate End date
   * @returns Price breakdown
   */
  static async calculatePrice(
    equipmentId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    daily_rate: number;
    weekly_rate: number | null;
    total_days: number;
    subtotal: number;
    damage_deposit: number;
    tax: number;
    total_amount: number;
  }> {
    // Get equipment pricing
    const query = `
      SELECT daily_rate, weekly_rate, damage_deposit
      FROM equipment
      WHERE id = $1
    `;
    const result = await pool.query(query, [equipmentId]);

    if (result.rows.length === 0) {
      throw new Error('Equipment not found');
    }

    const equipment = result.rows[0];

    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end day

    // Calculate optimal pricing (weekly vs daily)
    // DSA: Dynamic programming - choose best pricing strategy
    let subtotal: number;

    if (equipment.weekly_rate && totalDays >= 7) {
      const weeks = Math.floor(totalDays / 7);
      const remainingDays = totalDays % 7;
      subtotal = (weeks * equipment.weekly_rate) + (remainingDays * equipment.daily_rate);
    } else {
      subtotal = totalDays * equipment.daily_rate;
    }

    // Calculate tax (example: 8% - adjust based on your location)
    const taxRate = 0.08;
    const tax = parseFloat((subtotal * taxRate).toFixed(2));

    const total_amount = parseFloat((subtotal + tax + parseFloat(equipment.damage_deposit)).toFixed(2));

    return {
      daily_rate: parseFloat(equipment.daily_rate),
      weekly_rate: equipment.weekly_rate ? parseFloat(equipment.weekly_rate) : null,
      total_days: totalDays,
      subtotal: parseFloat(subtotal.toFixed(2)),
      damage_deposit: parseFloat(equipment.damage_deposit),
      tax,
      total_amount,
    };
  }

  /**
   * Create new booking
   */
  static async create(data: CreateBookingDTO): Promise<Booking> {
    // Check availability first
    const isAvailable = await this.checkAvailability(
      data.equipment_id,
      data.start_date,
      data.end_date
    );

    if (!isAvailable) {
      throw new Error('Equipment not available for selected dates');
    }

    // Calculate pricing
    const pricing = await this.calculatePrice(
      data.equipment_id,
      data.start_date,
      data.end_date
    );

    const query = `
      INSERT INTO bookings (
        user_id, equipment_id, start_date, end_date,
        daily_rate, subtotal, damage_deposit, tax, total_amount,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      data.user_id,
      data.equipment_id,
      data.start_date,
      data.end_date,
      pricing.daily_rate,
      pricing.subtotal,
      pricing.damage_deposit,
      pricing.tax,
      pricing.total_amount,
      data.notes || null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Get booking by ID
   */
  static async findById(id: string): Promise<any | null> {
    const query = `
      SELECT 
        b.*,
        u.first_name, u.last_name, u.email, u.phone,
        e.name as equipment_name, e.brand, e.model,
        c.name as category_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN equipment e ON b.equipment_id = e.id
      LEFT JOIN equipment_categories c ON e.category_id = c.id
      WHERE b.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get user's bookings
   */
  static async getUserBookings(
    userId: string,
    status?: string
  ): Promise<any[]> {
    let query = `
      SELECT 
        b.*,
        e.name as equipment_name, e.brand, e.model, e.images,
        c.name as category_name
      FROM bookings b
      JOIN equipment e ON b.equipment_id = e.id
      LEFT JOIN equipment_categories c ON e.category_id = c.id
      WHERE b.user_id = $1
    `;

    const values: any[] = [userId];

    if (status) {
      query += ` AND b.status = $2`;
      values.push(status);
    }

    query += ` ORDER BY b.created_at DESC`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  /**
   * Get all bookings (Admin)
   */
  static async getAll(
    status?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ bookings: any[]; total: number }> {
    let countQuery = `SELECT COUNT(*) as total FROM bookings`;
    let query = `
      SELECT 
        b.*,
        u.first_name, u.last_name, u.email,
        e.name as equipment_name, e.brand, e.model
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN equipment e ON b.equipment_id = e.id
    `;

    const values: any[] = [];
    let paramCount = 1;

    if (status) {
      countQuery += ` WHERE status = $1`;
      query += ` WHERE b.status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    // Get total count
    const statusValues = status ? [status] : [];
    const countResult = await pool.query(countQuery, statusValues);
    const total = parseInt(countResult.rows[0].total);

    // Get bookings
    query += ` ORDER BY b.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    return {
      bookings: result.rows,
      total,
    };
  }

  /**
   * Update booking status
   */
  static async updateStatus(
    id: string,
    status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  ): Promise<Booking> {
    const query = `
      UPDATE bookings
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [status, id]);

    if (result.rows.length === 0) {
      throw new Error('Booking not found');
    }

    return result.rows[0];
  }

  /**
   * Update payment status
   */
  static async updatePaymentStatus(
    id: string,
    paymentStatus: 'pending' | 'paid' | 'refunded',
    stripePaymentId?: string
  ): Promise<Booking> {
    const query = `
      UPDATE bookings
      SET 
        payment_status = $1,
        stripe_payment_id = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    const result = await pool.query(query, [paymentStatus, stripePaymentId || null, id]);

    if (result.rows.length === 0) {
      throw new Error('Booking not found');
    }

    return result.rows[0];
  }

  /**
   * Cancel booking
   */
  static async cancel(id: string, reason?: string): Promise<Booking> {
    const query = `
      UPDATE bookings
      SET 
        status = 'cancelled',
        cancellation_reason = $1,
        cancelled_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND status NOT IN ('completed', 'cancelled')
      RETURNING *
    `;

    const result = await pool.query(query, [reason || null, id]);

    if (result.rows.length === 0) {
      throw new Error('Booking not found or cannot be cancelled');
    }

    return result.rows[0];
  }

  /**
   * Get equipment availability calendar
   * Returns dates and their booking status
   */
  static async getAvailabilityCalendar(
    equipmentId: string,
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    const query = `
      SELECT 
        start_date,
        end_date,
        status
      FROM bookings
      WHERE equipment_id = $1
        AND status NOT IN ('cancelled', 'completed')
        AND (
          (start_date <= $3 AND end_date >= $2)
        )
      ORDER BY start_date ASC
    `;

    const result = await pool.query(query, [equipmentId, startDate, endDate]);
    return result.rows;
  }
}