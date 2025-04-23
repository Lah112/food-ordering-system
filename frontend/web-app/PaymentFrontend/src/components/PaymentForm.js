import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { createPaymentIntent, confirmPayment } from '../services/paymentService';
import './PaymentForm.css';

const PaymentForm = ({ order, onPaymentComplete }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment intent
      const paymentIntentResponse = await createPaymentIntent({
        orderId: order.id,
        amount: order.totalAmount,
        customerId: order.customerId,
        currency: 'usd' // Change as needed
      });

      const { clientSecret } = paymentIntentResponse;

      // Confirm card payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: order.customerName,
            email: order.customerEmail
          }
        }
      });

      if (result.error) {
        // Payment failed
        setError(result.error.message);
        navigate('/payment-failure', { 
          state: { 
            error: result.error.message,
            orderId: order.id
          } 
        });
      } else {
        // Payment succeeded
        if (result.paymentIntent.status === 'succeeded') {
          // Confirm payment with our backend
          await confirmPayment(result.paymentIntent.id);
          
          // Call callback function if provided
          if (onPaymentComplete) {
            onPaymentComplete(result.paymentIntent);
          }
          
          // Navigate to success page
          navigate('/payment-success', { 
            state: { 
              paymentId: result.paymentIntent.id,
              orderId: order.id
            } 
          });
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred while processing your payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-form-container">
      <form onSubmit={handleSubmit} className="payment-form">
        <h3>Enter Payment Details</h3>
        
        <div className="form-group">
          <label>Order Total:   {order.totalAmount.toFixed(2)}</label>
        </div>
        
        <div className="form-group">
          <label>Card Details</label>
          <div className="card-element-container">
            <CardElement 
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#32325d',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a',
                  },
                },
              }}
            />
          </div>
        </div>

        {error && <div className="payment-error">{error}</div>}
        
        <button 
          type="submit" 
          className="payment-button"
          disabled={!stripe || loading}
        >
          {loading ? 'Processing...' : `Pay   ${order.totalAmount.toFixed(2)}`}
        </button>
      </form>
    </div>

    
  );
};

export default PaymentForm;