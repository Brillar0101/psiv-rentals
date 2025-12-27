// src/controllers/equipment.controller.ts
// Equipment Controller - Handles equipment management operations

import { Request, Response } from 'express';
import { EquipmentModel } from '../models/equipment.model';

/**
 * Equipment Controller Class
 * Handles all equipment-related operations
 */
export class EquipmentController {
  /**
   * POST /api/equipment
   * Create new equipment (Admin only)
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const {
        category_id,
        name,
        brand,
        model,
        description,
        daily_rate,
        weekly_rate,
        replacement_value,
        damage_deposit,
        quantity_total,
        condition,
        images,
      } = req.body;

      // Validation
      if (!name || !daily_rate || !replacement_value || !damage_deposit) {
        res.status(400).json({
          success: false,
          error: 'Please provide name, daily_rate, replacement_value, and damage_deposit',
        });
        return;
      }

      if (daily_rate <= 0 || replacement_value <= 0 || damage_deposit < 0) {
        res.status(400).json({
          success: false,
          error: 'Rates and values must be positive numbers',
        });
        return;
      }

      const equipment = await EquipmentModel.create({
        category_id,
        name,
        brand,
        model,
        description,
        daily_rate: parseFloat(daily_rate),
        weekly_rate: weekly_rate ? parseFloat(weekly_rate) : undefined,
        replacement_value: parseFloat(replacement_value),
        damage_deposit: parseFloat(damage_deposit),
        quantity_total: quantity_total || 1,
        condition: condition || 'excellent',
        images: images || [],
      });

      res.status(201).json({
        success: true,
        message: 'Equipment added successfully! 📷',
        data: equipment,
      });
    } catch (error) {
      console.error('Create equipment error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create equipment',
      });
    }
  }

  /**
   * GET /api/equipment/:id
   * Get equipment by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const equipment = await EquipmentModel.findById(id);

      if (!equipment) {
        res.status(404).json({
          success: false,
          error: 'Equipment not found',
        });
        return;
      }

      res.json({
        success: true,
        data: equipment,
      });
    } catch (error) {
      console.error('Get equipment error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch equipment',
      });
    }
  }

  /**
   * GET /api/equipment
   * Get all equipment (with search/filter)
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        category_id,
        search,
        min_price,
        max_price,
        condition,
        available_only,
        sort_by,
        page,
        limit,
      } = req.query;

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 20;
      const offset = (pageNum - 1) * limitNum;

      const result = await EquipmentModel.search({
        category_id: category_id as string,
        search: search as string,
        min_price: min_price ? parseFloat(min_price as string) : undefined,
        max_price: max_price ? parseFloat(max_price as string) : undefined,
        condition: condition as string,
        available_only: available_only === 'true',
        sort_by: sort_by as any,
        limit: limitNum,
        offset,
      });

      res.json({
        success: true,
        data: result.equipment,
        meta: {
          total: result.total,
          page: pageNum,
          limit: limitNum,
          total_pages: Math.ceil(result.total / limitNum),
        },
      });
    } catch (error) {
      console.error('Get all equipment error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch equipment',
      });
    }
  }

  /**
   * PUT /api/equipment/:id
   * Update equipment (Admin only)
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Remove fields that shouldn't be updated directly
      delete updates.id;
      delete updates.created_at;
      delete updates.updated_at;
      delete updates.popularity_score;
      delete updates.average_rating;
      delete updates.total_bookings;

      const equipment = await EquipmentModel.update(id, updates);

      res.json({
        success: true,
        message: 'Equipment updated successfully! ✅',
        data: equipment,
      });
    } catch (error: any) {
      console.error('Update equipment error:', error);
      
      if (error.message === 'Equipment not found') {
        res.status(404).json({
          success: false,
          error: 'Equipment not found',
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update equipment',
      });
    }
  }

  /**
   * PATCH /api/equipment/:id/availability
   * Update equipment availability (Admin only)
   */
  static async updateAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { quantity_available, is_active } = req.body;

      if (quantity_available === undefined) {
        res.status(400).json({
          success: false,
          error: 'Please provide quantity_available',
        });
        return;
      }

      const equipment = await EquipmentModel.updateAvailability(
        id,
        parseInt(quantity_available),
        is_active !== undefined ? is_active : true
      );

      res.json({
        success: true,
        message: 'Availability updated successfully! ✅',
        data: equipment,
      });
    } catch (error: any) {
      console.error('Update availability error:', error);
      
      if (error.message === 'Equipment not found') {
        res.status(404).json({
          success: false,
          error: 'Equipment not found',
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update availability',
      });
    }
  }

  /**
   * DELETE /api/equipment/:id
   * Delete equipment (Admin only) - Soft delete
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { hard_delete } = req.query;

      let success: boolean;

      if (hard_delete === 'true') {
        // Permanent deletion
        success = await EquipmentModel.hardDelete(id);
      } else {
        // Soft delete (set is_active = false)
        success = await EquipmentModel.delete(id);
      }

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Equipment not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Equipment deleted successfully! 🗑️',
      });
    } catch (error) {
      console.error('Delete equipment error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete equipment',
      });
    }
  }

  /**
   * GET /api/equipment/category/:categoryId
   * Get equipment by category
   */
  static async getByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params;
      const { limit } = req.query;

      const equipment = await EquipmentModel.getByCategory(
        categoryId,
        limit ? parseInt(limit as string) : 20
      );

      res.json({
        success: true,
        data: equipment,
      });
    } catch (error) {
      console.error('Get by category error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch equipment',
      });
    }
  }
}
