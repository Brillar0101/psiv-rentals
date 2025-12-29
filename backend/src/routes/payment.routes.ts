// src/routes/payment.routes.ts
// Payment Routes - Define API endpoints for payments

import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/payments/create-intent
 * @desc    Create payment intent for booking
 * @access  Private (requires authentication)
 */
router.post('/create-intent', authenticate, PaymentController.createPaymentIntent);

/**
 * @route   POST /api/payments/confirm
 * @desc    Confirm payment was successful
 * @access  Public (called after Stripe confirms payment)
 */
router.post('/confirm', PaymentController.confirmPayment);

/**
 * @route   POST /api/payments/refund
 * @desc    Process refund for cancelled booking
 * @access  Private (Admin or booking owner)
 */
router.post('/refund', authenticate, PaymentController.refundPayment);

/**
 * @route   GET /api/payments/booking/:bookingId
 * @desc    Get payment status for booking
 * @access  Private (requires authentication)
 */
router.get('/booking/:bookingId', authenticate, PaymentController.getPaymentStatus);

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle Stripe webhook events
 * @access  Public (Stripe webhook)
 */
router.post('/webhook', PaymentController.handleWebhook);

export default router;
