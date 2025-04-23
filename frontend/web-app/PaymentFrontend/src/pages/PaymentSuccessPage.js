import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const PaymentSuccessPage = () => {
  const location = useLocation();
  const { paymentId, orderId } = location.state || {};

  return (
    <div style={{ textAlign: 'center', padding: '50px 20px' }}>
      <div style={{ 
        color: '#4caf50', 
        fontSize: '64px', 
        marginBottom: '20px' 
      }}>
        ✓
      </div>
      <h2 style={{ color: '#4caf50', marginBottom: '20px' }}>Payment Successful!</h2>
      <p>Your payment has been processed successfully.</p>
      <p>Order ID: {orderId}</p>
      <p>Payment ID: {paymentId}</p>
      <p>Thank you for your order!</p>
      <Link to="/" style={{
        display: 'inline-block',
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#4caf50',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '4px'
      }}>
        Return to Home
      </Link>
    </div>
  );
};

export default PaymentSuccessPage;