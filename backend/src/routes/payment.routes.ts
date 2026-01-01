// backend/src/routes/payment.routes.ts
import express from 'express';
import Stripe from 'stripe';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // Fixed: Use supported API version
});

// Create Payment Intent
router.post('/create-payment-intent', authenticate, async (req, res) => {
  try {
    const { amount, currency = 'usd', bookingId, equipmentId } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency,
      metadata: {
        bookingId,
        equipmentId,
        userId: req.user?.id || '', // Fixed: Added optional chaining
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error: any) {
    console.error('Payment intent creation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Confirm Payment
router.post('/confirm-payment', authenticate, async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      res.json({
        success: true,
        data: {
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
        },
      });
    } else {
      res.json({
        success: false,
        error: 'Payment not completed',
      });
    }
  } catch (error: any) {
    console.error('Payment confirmation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get Payment Status
router.get('/status/:paymentIntentId', authenticate, async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      success: true,
      data: {
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;