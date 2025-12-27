// src/models/user.model.ts
// User Model - Database operations for users
// DSA: Uses Hash Map concept (PostgreSQL indexes) for O(1) email lookups

import pool from '../config/database';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'customer' | 'admin';
  profile_image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: 'customer' | 'admin';
}

/**
 * User Model Class
 * Handles all database operations for users
 */
export class UserModel {
  /**
   * Create a new user
   * DSA: O(1) insertion using PostgreSQL's hash index on email
   */
  static async create(userData: CreateUserDTO): Promise<User> {
    try {
      // Hash password (bcrypt - industry standard)
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(userData.password, salt);

      const query = `
        INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, first_name, last_name, phone, role, created_at, updated_at
      `;

      const values = [
        userData.email.toLowerCase(),
        password_hash,
        userData.first_name,
        userData.last_name,
        userData.phone || null,
        userData.role || 'customer',
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error: any) {
      // Handle duplicate email error
      if (error.code === '23505') {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  /**
   * Find user by email
   * DSA: O(1) lookup using email index (Hash Map concept)
   */
  static async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT * FROM users WHERE email = $1
    `;
    const result = await pool.query(query, [email.toLowerCase()]);
    return result.rows[0] || null;
  }

  /**
   * Find user by ID
   * DSA: O(1) lookup using primary key index
   */
  static async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, first_name, last_name, phone, role, profile_image_url, created_at, updated_at
      FROM users WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Verify user password
   * @param plainPassword Password from login attempt
   * @param hashedPassword Hashed password from database
   * @returns true if passwords match
   */
  static async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update user profile
   */
  static async update(
    userId: string,
    updates: Partial<CreateUserDTO>
  ): Promise<User> {
    const allowedFields = ['first_name', 'last_name', 'phone'];
    const setClause: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Build dynamic UPDATE query
    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (setClause.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(userId);

    const query = `
      UPDATE users
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, email, first_name, last_name, phone, role, created_at, updated_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Get all users (admin only)
   * DSA: Returns paginated results to avoid loading entire table
   */
  static async getAll(limit: number = 50, offset: number = 0): Promise<User[]> {
    const query = `
      SELECT id, email, first_name, last_name, phone, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }
}
