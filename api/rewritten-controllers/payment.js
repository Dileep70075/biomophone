import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import Stripe from 'stripe';

export const prisma = new PrismaClient();
const stripe = new Stripe('your-stripe-secret-key');

export const createPaymentIntent = async (req, res) => {
  const { plan, userId } = req.body;

  try {
    const subscriptionPlan = subscriptionPlans[plan];
    if (!subscriptionPlan) {
      return res.status(400).json({ message: "Invalid subscription plan." });
    }

    const { price } = subscriptionPlan;

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price * 100, // Convert to cents
      currency: 'usd',
      metadata: { userId, plan },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Payment initialization failed.' });
  }
};

export const handlePaymentSuccess = async (req, res) => {
  const { paymentIntentId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const { userId, plan } = paymentIntent.metadata;
      const { duration } = subscriptionPlans[plan];
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(startDate.getMonth() + duration);

      await prisma.subscription.create({
        data: {
          userId,
          plan,
          amount: paymentIntent.amount / 100,
          startDate,
          endDate,
          isActive: true,
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { isPremium: true, membershipExpiry: endDate },
      });

      res.status(200).json({ message: 'Subscription updated successfully.' });
    } else {
      res.status(400).json({ message: 'Payment not successful.' });
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
    res.status(500).json({ message: 'Error updating subscription.' });
  }
};
