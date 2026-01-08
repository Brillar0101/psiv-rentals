// src/middleware/upload.ts
// File Upload Middleware - Configures multer for image uploads

import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

// Allowed image MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

// File size limit: 5MB per image
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Maximum number of images per upload
const MAX_FILES = 10;

// File filter function
const imageFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`));
  }
};

// Configure multer with memory storage (for S3 upload)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
  fileFilter: imageFilter,
});

// Export middleware for single and multiple file uploads
export const uploadSingleImage = upload.single('image');
export const uploadMultipleImages = upload.array('images', MAX_FILES);

// Error handler middleware for multer errors
export const handleMulterError = (
  error: any,
  req: Request,
  res: any,
  next: any
): void => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: `Too many files. Maximum is ${MAX_FILES} images`,
      });
    }
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  next();
};

export default upload;
