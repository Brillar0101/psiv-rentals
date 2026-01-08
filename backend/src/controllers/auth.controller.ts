// src/controllers/auth.controller.ts
// Authentication Controller - Handles signup, login, and user profile

import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { generateToken } from '../middleware/auth';

/**
 * Auth Controller Class
 * Handles all authentication-related operations
 */
export class AuthController {
  /**
   * POST /api/auth/signup
   * Register a new user
   */
  static async signup(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, first_name, last_name, phone, terms_accepted, data_collection_consent } = req.body;

      // Validation
      if (!email || !password || !first_name || !last_name) {
        res.status(400).json({
          success: false,
          error: 'Please provide email, password, first name, and last name',
        });
        return;
      }

      // Terms & Conditions validation
      if (!terms_accepted) {
        res.status(400).json({
          success: false,
          error: 'You must accept the Terms & Conditions to create an account',
        });
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          error: 'Invalid email format',
        });
        return;
      }

      // Password validation
      if (password.length < 6) {
        res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters',
        });
        return;
      }

      // Create user
      const user = await UserModel.create({
        email,
        password,
        first_name,
        last_name,
        phone,
        role: 'customer', // Default role
        terms_accepted: terms_accepted || false,
        data_collection_consent: data_collection_consent || false,
      });

      // Generate JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully!',
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            full_name: `${user.first_name} ${user.last_name}`.trim(),
            role: user.role,
          },
          token,
        },
      });
    } catch (error: any) {
      console.error('Signup error:', error);

      if (error.message === 'Email already exists') {
        res.status(409).json({
          success: false,
          error: 'Email already registered. Please login.',
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to create user. Please try again.',
      });
    }
  }

  /**
   * POST /api/auth/login
   * Login existing user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Please provide email and password',
        });
        return;
      }

      // Find user
      const user = await UserModel.findByEmail(email);

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password',
        });
        return;
      }

      // Verify password
      const isPasswordValid = await UserModel.verifyPassword(
        password,
        user.password_hash
      );

      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password',
        });
        return;
      }

      // Generate JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      res.json({
        success: true,
        message: 'Login successful!',
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            full_name: `${user.first_name} ${user.last_name}`.trim(),
            phone: user.phone,
            role: user.role,
            profile_image_url: user.profile_image_url,
          },
          token,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed. Please try again.',
      });
    }
  }

  /**
   * GET /api/auth/me
   * Get current user profile (requires authentication)
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      // req.user is set by authenticate middleware
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
        return;
      }

      const user = await UserModel.findById(req.user.id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          full_name: `${user.first_name} ${user.last_name}`.trim(),
          phone: user.phone,
          role: user.role,
          profile_image_url: user.profile_image_url,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch profile',
      });
    }
  }
}
