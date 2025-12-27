// src/models/category.model.ts
// Category Model - Database operations for equipment categories

import pool from '../config/database';

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  created_at: Date;
}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
  icon_url?: string;
}

/**
 * Category Model Class
 * Handles all database operations for equipment categories
 */
export class CategoryModel {
  /**
   * Get all categories
   * DSA: Simple query, returns all categories (small dataset)
   */
  static async getAll(): Promise<Category[]> {
    const query = `
      SELECT * FROM equipment_categories
      ORDER BY name ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get category by ID
   */
  static async findById(id: string): Promise<Category | null> {
    const query = `
      SELECT * FROM equipment_categories
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Create new category
   */
  static async create(data: CreateCategoryDTO): Promise<Category> {
    const query = `
      INSERT INTO equipment_categories (name, description, icon_url)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const values = [
      data.name,
      data.description || null,
      data.icon_url || null,
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new Error('Category name already exists');
      }
      throw error;
    }
  }

  /**
   * Update category
   */
  static async update(
    id: string,
    updates: Partial<CreateCategoryDTO>
  ): Promise<Category> {
    const allowedFields = ['name', 'description', 'icon_url'];
    const setClause: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

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

    values.push(id);

    const query = `
      UPDATE equipment_categories
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Category not found');
    }

    return result.rows[0];
  }

  /**
   * Delete category
   */
  static async delete(id: string): Promise<boolean> {
    const query = `
      DELETE FROM equipment_categories
      WHERE id = $1
      RETURNING id
    `;

    const result = await pool.query(query, [id]);
    return result.rows.length > 0;
  }

  /**
   * Get category with equipment count
   */
  static async getAllWithCount(): Promise<any[]> {
    const query = `
      SELECT 
        c.*,
        COUNT(e.id) as equipment_count
      FROM equipment_categories c
      LEFT JOIN equipment e ON c.id = e.category_id AND e.is_active = true
      GROUP BY c.id
      ORDER BY c.name ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}
