import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const PaymentFailurePage = () => {
  const location = useLocation();
  const { error, orderId } = location.state || {};

  return (
    <div style={{ textAlign: 'center', padding: '50px 20px' }}>
      <div style={{ 
        color: '#f44336', 
        fontSize: '64px', 
        marginBottom: '20px' 
      }}>
        ✗
      </div>
      <h2 style={{ color: '#f44336', marginBottom: '20px' }}>Payment Failed</h2>
      <p>We couldn't process your payment.</p>
      <p>Order ID: {orderId}</p>
      {error && <p>Error: {error}</p>}
      <p>Please try again or contact customer support if the problem persists.</p>
      <Link to={`/checkout/${orderId}`} style={{
        display: 'inline-block',
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#f44336',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '4px'
      }}>
        Try Again
      </Link>
    </div>
  );
};

export default PaymentFailurePage;