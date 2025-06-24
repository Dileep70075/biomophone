import express from 'express';
import { createPaymentIntent, handlePaymentSuccess } from '../rewritten-controllers/payment.js';

const router = express.Router();

// Create a payment intent
router.post('/payments/create-intent', createPaymentIntent);

// Handle payment success
router.post('/payments/success', handlePaymentSuccess);

export default router;
