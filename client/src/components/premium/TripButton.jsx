import React from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('your-publishable-stripe-key');

const TipButton = ({ creatorId, amount }) => {
  const handlePayment = async () => {
    try {
      const stripe = await stripePromise;

      const response = await fetch('http://localhost:8800/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId, amount }),
      });

      const session = await response.json();
      if (session.id) {
        await stripe.redirectToCheckout({ sessionId: session.id });
      } else {
        console.error('Checkout session creation failed');
        alert('Unable to process payment. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  return <button className="tip-button" onClick={handlePayment}>Tip ${amount}</button>;
};

export default TipButton;