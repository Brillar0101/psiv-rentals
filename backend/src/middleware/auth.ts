// src/middleware/auth.ts
// Authentication Middleware - Protects API routes with JWT tokens

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

const JWT_SECRET: string = process.env.JWT_SECRET || 'your_secret_key';

/**
 * Middleware: Verify JWT token and attach user to request
 * Usage: Add this to routes that require authentication
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No token provided. Please login.',
      });
      return;
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    // Attach user info to request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    // Continue to next middleware/route
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
      return;
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expired. Please login again.',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Authentication error',
    });
  }
};

/**
 * Middleware: Check if user has required role (admin/customer)
 * Usage: authorize('admin') - only admins can access
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions. Admin access required.',
      });
      return;
    }

    next();
  };
};

/**
 * Generate JWT access token
 * @param user User object with id, email, role
 * @returns JWT token string
 */
export const generateToken = (user: {
  id: string;
  email: string;
  role: string;
}): string => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  
  const options: jwt.SignOptions = {
    expiresIn: '7d',
  };
  
  return jwt.sign(payload, JWT_SECRET, options);
};