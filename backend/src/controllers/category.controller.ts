// src/controllers/category.controller.ts
// Category Controller - Handles equipment category operations

import { Request, Response } from 'express';
import { CategoryModel } from '../models/category.model';

/**
 * Category Controller Class
 * Handles all category-related operations
 */
export class CategoryController {
  /**
   * GET /api/categories
   * Get all categories (with optional equipment count)
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { with_count } = req.query;

      let categories;

      if (with_count === 'true') {
        categories = await CategoryModel.getAllWithCount();
      } else {
        categories = await CategoryModel.getAll();
      }

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch categories',
      });
    }
  }

  /**
   * GET /api/categories/:id
   * Get category by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const category = await CategoryModel.findById(id);

      if (!category) {
        res.status(404).json({
          success: false,
          error: 'Category not found',
        });
        return;
      }

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      console.error('Get category error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch category',
      });
    }
  }

  /**
   * POST /api/categories
   * Create new category (Admin only)
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, icon_url } = req.body;

      if (!name) {
        res.status(400).json({
          success: false,
          error: 'Please provide category name',
        });
        return;
      }

      const category = await CategoryModel.create({
        name,
        description,
        icon_url,
      });

      res.status(201).json({
        success: true,
        message: 'Category created successfully! 📁',
        data: category,
      });
    } catch (error: any) {
      console.error('Create category error:', error);

      if (error.message === 'Category name already exists') {
        res.status(409).json({
          success: false,
          error: 'Category name already exists',
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to create category',
      });
    }
  }

  /**
   * PUT /api/categories/:id
   * Update category (Admin only)
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const category = await CategoryModel.update(id, updates);

      res.json({
        success: true,
        message: 'Category updated successfully! ✅',
        data: category,
      });
    } catch (error: any) {
      console.error('Update category error:', error);

      if (error.message === 'Category not found') {
        res.status(404).json({
          success: false,
          error: 'Category not found',
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update category',
      });
    }
  }

  /**
   * DELETE /api/categories/:id
   * Delete category (Admin only)
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const success = await CategoryModel.delete(id);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Category not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Category deleted successfully! 🗑️',
      });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete category',
      });
    }
  }
}
