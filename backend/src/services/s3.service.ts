// src/services/s3.service.ts
// S3 Service - Handles AWS S3 file operations

import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Initialize S3 client
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'psiv-rentals-equipment-images';

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * S3 Service Class
 * Handles all S3 file operations
 */
export class S3Service {
  /**
   * Upload file to S3
   * @param buffer File buffer
   * @param key S3 object key (path/filename)
   * @param contentType MIME type
   * @returns Upload result with URL and key
   */
  static async uploadFile(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<UploadResult> {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    };

    try {
      await s3.upload(params).promise();

      const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

      return { url, key };
    } catch (error: any) {
      console.error('S3 upload error:', error);
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  /**
   * Delete file from S3
   * @param key S3 object key
   */
  static async deleteFile(key: string): Promise<void> {
    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    try {
      await s3.deleteObject(params).promise();
    } catch (error: any) {
      console.error('S3 delete error:', error);
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  /**
   * Delete multiple files from S3
   * @param keys Array of S3 object keys
   */
  static async deleteFiles(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    const params: AWS.S3.DeleteObjectsRequest = {
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
      },
    };

    try {
      await s3.deleteObjects(params).promise();
    } catch (error: any) {
      console.error('S3 bulk delete error:', error);
      throw new Error(`Failed to delete files from S3: ${error.message}`);
    }
  }

  /**
   * Extract S3 key from URL
   * @param url Full S3 URL
   * @returns S3 object key
   */
  static extractKeyFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove leading slash from pathname
      return urlObj.pathname.substring(1);
    } catch {
      // If URL parsing fails, try to extract key directly
      const match = url.match(/\.amazonaws\.com\/(.+)$/);
      return match ? match[1] : url;
    }
  }

  /**
   * Generate a unique key for equipment images
   * @param equipmentId Equipment ID
   * @param originalFilename Original filename
   * @returns Unique S3 key
   */
  static generateEquipmentImageKey(
    equipmentId: string,
    originalFilename: string
  ): string {
    const timestamp = Date.now();
    const extension = originalFilename.split('.').pop()?.toLowerCase() || 'jpg';
    return `equipment/${equipmentId}/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;
  }

  /**
   * Generate a unique key for profile pictures
   * @param userId User ID
   * @param originalFilename Original filename
   * @returns Unique S3 key
   */
  static generateProfileImageKey(
    userId: string,
    originalFilename: string
  ): string {
    const timestamp = Date.now();
    const extension = originalFilename.split('.').pop()?.toLowerCase() || 'jpg';
    return `profiles/${userId}/${timestamp}.${extension}`;
  }
}
