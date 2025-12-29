// src/controllers/payment.controller.ts
// Payment Controller - Handles payment operations

import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { BookingModel } from '../models/booking.model';
import pool from '../config/database';

/**
 * Payment Controller Class
 * Handles all payment-related operations
 */
export class PaymentController {
  /**
   * POST /api/payments/create-intent
   * Create payment intent for a booking
   */
  static async createPaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
        return;
      }

      const { booking_id } = req.body;

      if (!booking_id) {
        res.status(400).json({
          success: false,
          error: 'Please provide booking_id',
        });
        return;
      }

      // Get booking details
      const booking = await BookingModel.findById(booking_id);

      if (!booking) {
        res.status(404).json({
          success: false,
          error: 'Booking not found',
        });
        return;
      }

      // Verify user owns this booking
      if (booking.user_id !== req.user.id) {
        res.status(403).json({
          success: false,
          error: 'Access denied',
        });
        return;
      }

      // Check if already paid
      if (booking.payment_status === 'paid') {
        res.status(400).json({
          success: false,
          error: 'Booking is already paid',
        });
        return;
      }

      // Create payment intent
      const paymentIntent = await PaymentService.createPaymentIntent({
        amount: parseFloat(booking.total_amount),
        description: `PSIV Rentals - ${booking.equipment_name} (${booking.start_date} to ${booking.end_date})`,
        metadata: {
          booking_id: booking.id,
          user_id: booking.user_id,
          equipment_id: booking.equipment_id,
          equipment_name: booking.equipment_name,
        },
      });

      // Update booking with payment intent ID
      await pool.query(
        'UPDATE bookings SET stripe_payment_id = $1 WHERE id = $2',
        [paymentIntent.id, booking_id]
      );

      res.json({
        success: true,
        message: 'Payment intent created! 💳',
        data: {
          client_secret: paymentIntent.client_secret,
          payment_intent_id: paymentIntent.id,
          amount: booking.total_amount,
        },
      });
    } catch (error: any) {
      console.error('Create payment intent error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create payment intent',
      });
    }
  }

  /**
   * POST /api/payments/confirm
   * Confirm payment was successful
   */
  static async confirmPayment(req: Request, res: Response): Promise<void> {
    try {
      const { payment_intent_id } = req.body;

      if (!payment_intent_id) {
        res.status(400).json({
          success: false,
          error: 'Please provide payment_intent_id',
        });
        return;
      }

      // Get payment intent from Stripe
      const paymentIntent = await PaymentService.getPaymentIntent(payment_intent_id);

      if (paymentIntent.status !== 'succeeded') {
        res.status(400).json({
          success: false,
          error: 'Payment has not succeeded yet',
          status: paymentIntent.status,
        });
        return;
      }

      // Update booking payment status
      const result = await pool.query(
        `UPDATE bookings 
         SET payment_status = 'paid', 
             status = 'confirmed',
             confirmed_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE stripe_payment_id = $1
         RETURNING *`,
        [payment_intent_id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Booking not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Payment confirmed! Booking is now confirmed! 🎉',
        data: result.rows[0],
      });
    } catch (error: any) {
      console.error('Confirm payment error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to confirm payment',
      });
    }
  }

  /**
   * POST /api/payments/refund
   * Process refund for cancelled booking
   */
  static async refundPayment(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
        return;
      }

      const { booking_id, amount, reason } = req.body;

      if (!booking_id) {
        res.status(400).json({
          success: false,
          error: 'Please provide booking_id',
        });
        return;
      }

      // Get booking
      const booking = await BookingModel.findById(booking_id);

      if (!booking) {
        res.status(404).json({
          success: false,
          error: 'Booking not found',
        });
        return;
      }

      // Check permissions (admin or booking owner)
      if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
        res.status(403).json({
          success: false,
          error: 'Access denied',
        });
        return;
      }

      // Check if booking has payment
      if (!booking.stripe_payment_id) {
        res.status(400).json({
          success: false,
          error: 'No payment found for this booking',
        });
        return;
      }

      // Check if already refunded
      if (booking.payment_status === 'refunded') {
        res.status(400).json({
          success: false,
          error: 'Payment already refunded',
        });
        return;
      }

      // Create refund
      const refund = await PaymentService.createRefund({
        paymentIntentId: booking.stripe_payment_id,
        amount: amount ? parseFloat(amount) : undefined,
        reason: reason || 'requested_by_customer',
      });

      // Update booking payment status
      await pool.query(
        `UPDATE bookings 
         SET payment_status = 'refunded',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [booking_id]
      );

      res.json({
        success: true,
        message: 'Refund processed successfully! 💰',
        data: {
          refund_id: refund.id,
          amount: refund.amount / 100, // Convert cents to dollars
          status: refund.status,
        },
      });
    } catch (error: any) {
      console.error('Refund payment error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to process refund',
      });
    }
  }

  /**
   * GET /api/payments/booking/:bookingId
   * Get payment status for a booking
   */
  static async getPaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId } = req.params;

      const booking = await BookingModel.findById(bookingId);

      if (!booking) {
        res.status(404).json({
          success: false,
          error: 'Booking not found',
        });
        return;
      }

      // Check permissions
      if (
        req.user &&
        req.user.id !== booking.user_id &&
        req.user.role !== 'admin'
      ) {
        res.status(403).json({
          success: false,
          error: 'Access denied',
        });
        return;
      }

      let paymentDetails = null;

      if (booking.stripe_payment_id) {
        const paymentIntent = await PaymentService.getPaymentIntent(
          booking.stripe_payment_id
        );

        paymentDetails = {
          payment_intent_id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          created: new Date(paymentIntent.created * 1000),
        };
      }

      res.json({
        success: true,
        data: {
          booking_id: booking.id,
          payment_status: booking.payment_status,
          total_amount: booking.total_amount,
          payment_details: paymentDetails,
        },
      });
    } catch (error: any) {
      console.error('Get payment status error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get payment status',
      });
    }
  }

  /**
   * POST /api/payments/webhook
   * Handle Stripe webhook events
   */
  static async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

      if (!signature) {
        res.status(400).json({
          success: false,
          error: 'Missing stripe-signature header',
        });
        return;
      }

      // Verify webhook signature
      const event = PaymentService.verifyWebhookSignature(
        req.body,
        signature,
        webhookSecret
      );

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as any;
          
          // Update booking status
          await pool.query(
            `UPDATE bookings 
             SET payment_status = 'paid',
                 status = 'confirmed',
                 confirmed_at = CURRENT_TIMESTAMP
             WHERE stripe_payment_id = $1`,
            [paymentIntent.id]
          );
          
          console.log('✅ Payment succeeded:', paymentIntent.id);
          break;

        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object as any;
          console.log('❌ Payment failed:', failedPayment.id);
          break;

        case 'charge.refunded':
          const refund = event.data.object as any;
          console.log('💰 Refund processed:', refund.id);
          break;

        default:
          console.log('Unhandled event type:', event.type);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Webhook processing failed',
      });
    }
  }
}
