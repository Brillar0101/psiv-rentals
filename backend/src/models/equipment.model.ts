// src/models/equipment.model.ts
// Equipment Model - Database operations for equipment
// DSA: Uses indexes for O(log n) search, Hash Map for category lookups

import pool from '../config/database';

export interface Equipment {
  id: string;
  category_id?: string;
  name: string;
  brand?: string;
  model?: string;
  description?: string;
  daily_rate: number;
  weekly_rate?: number;
  replacement_value: number;
  damage_deposit: number;
  quantity_total: number;
  quantity_available: number;
  condition: 'excellent' | 'good' | 'fair' | 'maintenance';
  images: string[];
  is_active: boolean;
  popularity_score: number;
  average_rating: number;
  total_bookings: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateEquipmentDTO {
  category_id?: string;
  name: string;
  brand?: string;
  model?: string;
  description?: string;
  daily_rate: number;
  weekly_rate?: number;
  replacement_value: number;
  damage_deposit: number;
  quantity_total?: number;
  condition?: 'excellent' | 'good' | 'fair' | 'maintenance';
  images?: string[];
}

export interface SearchEquipmentQuery {
  category_id?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  condition?: string;
  available_only?: boolean;
  sort_by?: 'price_asc' | 'price_desc' | 'popularity' | 'rating' | 'newest';
  limit?: number;
  offset?: number;
}

/**
 * Equipment Model Class
 * Handles all database operations for equipment
 */
export class EquipmentModel {
  /**
   * Create new equipment
   * @param data Equipment data
   * @returns Created equipment
   */
  static async create(data: CreateEquipmentDTO): Promise<Equipment> {
    const query = `
      INSERT INTO equipment (
        category_id, name, brand, model, description,
        daily_rate, weekly_rate, replacement_value, damage_deposit,
        quantity_total, quantity_available, condition, images
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const values = [
      data.category_id || null,
      data.name,
      data.brand || null,
      data.model || null,
      data.description || null,
      data.daily_rate,
      data.weekly_rate || null,
      data.replacement_value,
      data.damage_deposit,
      data.quantity_total || 1,
      data.quantity_total || 1, // quantity_available starts same as quantity_total
      data.condition || 'excellent',
      JSON.stringify(data.images || []),
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Get equipment by ID
   * DSA: O(1) lookup using primary key index
   */
  static async findById(id: string): Promise<Equipment | null> {
    const query = `
      SELECT e.*, c.name as category_name
      FROM equipment e
      LEFT JOIN equipment_categories c ON e.category_id = c.id
      WHERE e.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Search and filter equipment
   * DSA: Uses B-tree indexes for efficient filtering
   */
  static async search(filters: SearchEquipmentQuery): Promise<{
    equipment: Equipment[];
    total: number;
  }> {
    let conditions: string[] = [];
    let values: any[] = [];
    let paramCount = 1;

    // Build WHERE conditions dynamically
    if (filters.category_id) {
      conditions.push(`e.category_id = $${paramCount}`);
      values.push(filters.category_id);
      paramCount++;
    }

    if (filters.search) {
      conditions.push(`(
        e.name ILIKE $${paramCount} OR 
        e.brand ILIKE $${paramCount} OR 
        e.model ILIKE $${paramCount} OR
        e.description ILIKE $${paramCount}
      )`);
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    if (filters.min_price !== undefined) {
      conditions.push(`e.daily_rate >= $${paramCount}`);
      values.push(filters.min_price);
      paramCount++;
    }

    if (filters.max_price !== undefined) {
      conditions.push(`e.daily_rate <= $${paramCount}`);
      values.push(filters.max_price);
      paramCount++;
    }

    if (filters.condition) {
      conditions.push(`e.condition = $${paramCount}`);
      values.push(filters.condition);
      paramCount++;
    }

    if (filters.available_only) {
      conditions.push(`e.quantity_available > 0 AND e.is_active = true`);
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    // Sorting
    let orderBy = 'ORDER BY e.created_at DESC';
    switch (filters.sort_by) {
      case 'price_asc':
        orderBy = 'ORDER BY e.daily_rate ASC';
        break;
      case 'price_desc':
        orderBy = 'ORDER BY e.daily_rate DESC';
        break;
      case 'popularity':
        orderBy = 'ORDER BY e.popularity_score DESC';
        break;
      case 'rating':
        orderBy = 'ORDER BY e.average_rating DESC';
        break;
      case 'newest':
        orderBy = 'ORDER BY e.created_at DESC';
        break;
    }

    // Pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM equipment e
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Get equipment
    const query = `
      SELECT e.*, c.name as category_name
      FROM equipment e
      LEFT JOIN equipment_categories c ON e.category_id = c.id
      ${whereClause}
      ${orderBy}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    return {
      equipment: result.rows,
      total,
    };
  }

  /**
   * Get all equipment (with pagination)
   */
  static async getAll(limit: number = 20, offset: number = 0): Promise<{
    equipment: Equipment[];
    total: number;
  }> {
    const countQuery = 'SELECT COUNT(*) as total FROM equipment';
    const countResult = await pool.query(countQuery);
    const total = parseInt(countResult.rows[0].total);

    const query = `
      SELECT e.*, c.name as category_name
      FROM equipment e
      LEFT JOIN equipment_categories c ON e.category_id = c.id
      ORDER BY e.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);

    return {
      equipment: result.rows,
      total,
    };
  }

  /**
   * Update equipment
   */
  static async update(
    id: string,
    updates: Partial<CreateEquipmentDTO>
  ): Promise<Equipment> {
    const allowedFields = [
      'category_id', 'name', 'brand', 'model', 'description',
      'daily_rate', 'weekly_rate', 'replacement_value', 'damage_deposit',
      'quantity_total', 'condition', 'images'
    ];

    const setClause: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        if (key === 'images') {
          setClause.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(value));
        } else {
          setClause.push(`${key} = $${paramCount}`);
          values.push(value);
        }
        paramCount++;
      }
    });

    if (setClause.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);

    const query = `
      UPDATE equipment
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Equipment not found');
    }

    return result.rows[0];
  }

  /**
   * Update equipment availability
   * Admin can manually mark equipment as available/unavailable
   */
  static async updateAvailability(
    id: string,
    quantityAvailable: number,
    isActive: boolean = true
  ): Promise<Equipment> {
    const query = `
      UPDATE equipment
      SET quantity_available = $1, is_active = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    const result = await pool.query(query, [quantityAvailable, isActive, id]);
    
    if (result.rows.length === 0) {
      throw new Error('Equipment not found');
    }

    return result.rows[0];
  }

  /**
   * Delete equipment (soft delete by setting is_active = false)
   */
  static async delete(id: string): Promise<boolean> {
    const query = `
      UPDATE equipment
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `;

    const result = await pool.query(query, [id]);
    return result.rows.length > 0;
  }

  /**
   * Hard delete equipment (permanently remove from database)
   */
  static async hardDelete(id: string): Promise<boolean> {
    const query = 'DELETE FROM equipment WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0;
  }

  /**
   * Get equipment by category
   */
  static async getByCategory(categoryId: string, limit: number = 20): Promise<Equipment[]> {
    const query = `
      SELECT e.*, c.name as category_name
      FROM equipment e
      LEFT JOIN equipment_categories c ON e.category_id = c.id
      WHERE e.category_id = $1 AND e.is_active = true
      ORDER BY e.popularity_score DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [categoryId, limit]);
    return result.rows;
  }
}
