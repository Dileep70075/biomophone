import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const PaymentModal = ({ plan, onClose, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);

  const handlePayment = async (e) => {
    e.preventDefault();
    const cardElement = elements.getElement(CardElement);

    const response = await fetch('http://localhost:8800/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, userId: 'currentUserId' }),
    });

    const { clientSecret } = await response.json();

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (result.error) {
      setError(result.error.message);
    } else if (result.paymentIntent.status === 'succeeded') {
      await fetch('http://localhost:8800/api/payments/success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId: result.paymentIntent.id }),
      });

      onSuccess();
      onClose();
    }
  };

  return (
    <div className="payment-modal">
      <h2>Complete Payment for {plan} Plan</h2>
      <form onSubmit={handlePayment}>
        <CardElement />
        <button type="submit" disabled={!stripe}>
          Pay Now
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default PaymentModal;
