// src/services/payment.service.ts
// Payment Service - Handles Stripe payment processing

import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export interface CreatePaymentIntentDTO {
  amount: number; // Amount in dollars
  currency?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface RefundPaymentDTO {
  paymentIntentId: string;
  amount?: number; // Optional partial refund amount
  reason?: string;
}

/**
 * Payment Service Class
 * Handles all Stripe payment operations
 */
export class PaymentService {
  /**
   * Create payment intent
   * This is what the mobile app will use to collect payment
   * 
   * @param data Payment details
   * @returns Stripe PaymentIntent with client_secret
   */
  static async createPaymentIntent(
    data: CreatePaymentIntentDTO
  ): Promise<Stripe.PaymentIntent> {
    try {
      // Convert dollars to cents (Stripe uses smallest currency unit)
      const amountInCents = Math.round(data.amount * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: data.currency || 'usd',
        description: data.description,
        metadata: data.metadata || {},
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error: any) {
      console.error('Stripe payment intent error:', error);
      throw new Error(`Payment intent creation failed: ${error.message}`);
    }
  }

  /**
   * Retrieve payment intent
   * 
   * @param paymentIntentId Payment intent ID
   * @returns PaymentIntent object
   */
  static async getPaymentIntent(
    paymentIntentId: string
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error: any) {
      console.error('Stripe retrieve payment error:', error);
      throw new Error(`Failed to retrieve payment: ${error.message}`);
    }
  }

  /**
   * Confirm payment intent
   * (Usually done automatically by Stripe Elements on frontend)
   * 
   * @param paymentIntentId Payment intent ID
   * @returns Confirmed PaymentIntent
   */
  static async confirmPaymentIntent(
    paymentIntentId: string
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
      return paymentIntent;
    } catch (error: any) {
      console.error('Stripe confirm payment error:', error);
      throw new Error(`Payment confirmation failed: ${error.message}`);
    }
  }

  /**
   * Cancel payment intent
   * 
   * @param paymentIntentId Payment intent ID
   * @returns Cancelled PaymentIntent
   */
  static async cancelPaymentIntent(
    paymentIntentId: string
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
      return paymentIntent;
    } catch (error: any) {
      console.error('Stripe cancel payment error:', error);
      throw new Error(`Payment cancellation failed: ${error.message}`);
    }
  }

  /**
   * Create refund
   * Used when booking is cancelled or equipment is damaged
   * 
   * @param data Refund details
   * @returns Stripe Refund object
   */
  static async createRefund(data: RefundPaymentDTO): Promise<Stripe.Refund> {
    try {
      const refundData: Stripe.RefundCreateParams = {
        payment_intent: data.paymentIntentId,
      };

      // Add partial refund amount if specified (in cents)
      if (data.amount) {
        refundData.amount = Math.round(data.amount * 100);
      }

      if (data.reason) {
        refundData.reason = data.reason as Stripe.RefundCreateParams.Reason;
      }

      const refund = await stripe.refunds.create(refundData);
      return refund;
    } catch (error: any) {
      console.error('Stripe refund error:', error);
      throw new Error(`Refund creation failed: ${error.message}`);
    }
  }

  /**
   * Create customer
   * Stores customer info in Stripe for future payments
   * 
   * @param email Customer email
   * @param name Customer name
   * @param metadata Additional metadata
   * @returns Stripe Customer object
   */
  static async createCustomer(
    email: string,
    name: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: metadata || {},
      });

      return customer;
    } catch (error: any) {
      console.error('Stripe create customer error:', error);
      throw new Error(`Customer creation failed: ${error.message}`);
    }
  }

  /**
   * Get customer
   * 
   * @param customerId Stripe customer ID
   * @returns Stripe Customer object
   */
  static async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      return customer as Stripe.Customer;
    } catch (error: any) {
      console.error('Stripe get customer error:', error);
      throw new Error(`Failed to retrieve customer: ${error.message}`);
    }
  }

  /**
   * Capture authorized payment
   * For holding deposits that are captured later
   * 
   * @param paymentIntentId Payment intent ID
   * @param amount Optional amount to capture (defaults to full amount)
   * @returns Captured PaymentIntent
   */
  static async capturePayment(
    paymentIntentId: string,
    amount?: number
  ): Promise<Stripe.PaymentIntent> {
    try {
      const captureData: Stripe.PaymentIntentCaptureParams = {};

      if (amount) {
        captureData.amount_to_capture = Math.round(amount * 100);
      }

      const paymentIntent = await stripe.paymentIntents.capture(
        paymentIntentId,
        captureData
      );

      return paymentIntent;
    } catch (error: any) {
      console.error('Stripe capture payment error:', error);
      throw new Error(`Payment capture failed: ${error.message}`);
    }
  }

  /**
   * Release authorized payment
   * Releases a held deposit without capturing
   * 
   * @param paymentIntentId Payment intent ID
   * @returns Cancelled PaymentIntent
   */
  static async releasePayment(
    paymentIntentId: string
  ): Promise<Stripe.PaymentIntent> {
    try {
      return await this.cancelPaymentIntent(paymentIntentId);
    } catch (error: any) {
      console.error('Stripe release payment error:', error);
      throw new Error(`Payment release failed: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature
   * Used to verify Stripe webhook events
   * 
   * @param payload Request body
   * @param signature Stripe signature header
   * @param webhookSecret Webhook secret from Stripe dashboard
   * @returns Verified Stripe event
   */
  static verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
  ): Stripe.Event {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
      return event;
    } catch (error: any) {
      console.error('Stripe webhook verification error:', error);
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
  }
}