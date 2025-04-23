import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import './App.css';

// Load Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function App() {
  return (
    <Router>
      <div className="app">
        <Elements stripe={stripePromise}>
          <Routes>
            {/* Redirect root path to a mock order for demo purposes */}
            <Route path="/" element={<Navigate to="/checkout/demo-order-123" replace />} />
            <Route path="/checkout/:orderId" element={<CheckoutPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/payment-failure" element={<PaymentFailurePage />} />
          </Routes>
        </Elements>
      </div>
    </Router>
  );
}

export default App;