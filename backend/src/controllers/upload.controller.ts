// src/controllers/upload.controller.ts
// Upload Controller - Handles equipment image uploads

import { Request, Response } from 'express';
import { S3Service } from '../services/s3.service';
import { EquipmentModel } from '../models/equipment.model';

const MAX_IMAGES_PER_EQUIPMENT = 10;

export class UploadController {
  /**
   * Upload images for equipment
   * POST /api/equipment/:id/images
   */
  static async uploadEquipmentImages(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No files uploaded',
        });
        return;
      }

      // Check if equipment exists
      const equipment = await EquipmentModel.findById(id);
      if (!equipment) {
        res.status(404).json({
          success: false,
          error: 'Equipment not found',
        });
        return;
      }

      // Check image limit
      const currentImages = equipment.images || [];
      if (currentImages.length + files.length > MAX_IMAGES_PER_EQUIPMENT) {
        res.status(400).json({
          success: false,
          error: `Cannot upload ${files.length} images. Equipment can have max ${MAX_IMAGES_PER_EQUIPMENT} images. Current: ${currentImages.length}`,
        });
        return;
      }

      // Upload each file to S3
      const uploadPromises = files.map(async (file) => {
        const key = S3Service.generateEquipmentImageKey(id, file.originalname);
        const result = await S3Service.uploadFile(file.buffer, key, file.mimetype);
        return result.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      // Update equipment with new image URLs
      const updatedImages = [...currentImages, ...uploadedUrls];
      await EquipmentModel.update(id, { images: updatedImages });

      res.status(200).json({
        success: true,
        data: {
          uploaded: uploadedUrls,
          total: updatedImages.length,
          images: updatedImages,
        },
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to upload images',
      });
    }
  }

  /**
   * Delete an image from equipment
   * DELETE /api/equipment/:id/images
   * Body: { imageUrl: string }
   */
  static async deleteEquipmentImage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { imageUrl } = req.body;

      if (!imageUrl) {
        res.status(400).json({
          success: false,
          error: 'imageUrl is required',
        });
        return;
      }

      // Check if equipment exists
      const equipment = await EquipmentModel.findById(id);
      if (!equipment) {
        res.status(404).json({
          success: false,
          error: 'Equipment not found',
        });
        return;
      }

      // Check if image exists in equipment
      const currentImages = equipment.images || [];
      if (!currentImages.includes(imageUrl)) {
        res.status(404).json({
          success: false,
          error: 'Image not found in equipment',
        });
        return;
      }

      // Delete from S3
      const key = S3Service.extractKeyFromUrl(imageUrl);
      await S3Service.deleteFile(key);

      // Update equipment - remove the image URL
      const updatedImages = currentImages.filter((url) => url !== imageUrl);
      await EquipmentModel.update(id, { images: updatedImages });

      res.status(200).json({
        success: true,
        data: {
          deleted: imageUrl,
          remaining: updatedImages.length,
          images: updatedImages,
        },
      });
    } catch (error: any) {
      console.error('Delete image error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete image',
      });
    }
  }
}
