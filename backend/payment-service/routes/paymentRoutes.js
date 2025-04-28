const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Create payment intent
router.post('/create-payment-intent', paymentController.createPaymentIntent);

// Confirm payment
router.post('/confirm', paymentController.confirmPayment);

// Handle Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// Get payment by ID
router.get('/:id', paymentController.getPaymentById);

// Get payment by order ID
router.get('/order/:orderId', paymentController.getPaymentByOrderId);

module.exports = router;
