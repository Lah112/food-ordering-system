import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import PaymentForm from '../components/PaymentForm';
import axios from 'axios';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // In a real application, you would fetch this from your order service
        const response = await axios.get(`${process.env.REACT_APP_ORDER_SERVICE_URL}/api/orders/${orderId}`);
        setOrder(response.data.order);
      } catch (err) {
        setError('Failed to load order details. Please try again.');
        console.error('Error fetching order:', err);
        
        // For demo purposes, create a mock order if the order service is not available
        setOrder({
          id: orderId,
          customerId: 'cust_123',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          items: [
            { name: 'Burger', price: 9.99, quantity: 2 },
            { name: 'Fries', price: 3.99, quantity: 1 },
            { name: 'Soda', price: 1.99, quantity: 1 }
          ],
          totalAmount: 25.96,
          status: 'awaiting_payment'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handlePaymentComplete = () => {
    // You can add any additional logic here
    console.log('Payment completed successfully');
  };

  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }

  if (error && !order) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="checkout-page">
      <h2>Complete Your Order</h2>
      
      <div className="order-summary">
        <h3>Order Summary</h3>
        <p><strong>Order ID:</strong> {order.id}</p>
        
        <table className="order-items">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>LKR {item.price.toFixed(2)}</td>
                <td>LKR{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3"><strong>Total</strong></td>
              <td><strong>LKR {order.totalAmount.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      <PaymentForm 
        order={order} 
        onPaymentComplete={handlePaymentComplete} 
      />
      
      <button 
        onClick={() => navigate(-1)} 
        className="back-button"
      >
        Back to Order
      </button>
    </div>
  );
};

export default CheckoutPage;