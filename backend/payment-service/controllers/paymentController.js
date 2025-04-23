const stripe = require('stripe')(require('../config').stripeSecretKey);
const Payment = require('../models/Payment');
const axios = require('axios');
const config = require('../config');

// Create a payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const { orderId, amount, customerId, customerEmail, customerPhone, currency = 'LKR' } = req.body;

    if (!orderId || !amount || !customerId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, amount, and customer ID are required'
      });
    }

    // Check if payment already exists for this order
    const existingPayment = await Payment.findOne({ orderId });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment for this order already exists'
      });
    }

        // Validate email and phone
        if (!customerEmail || !customerPhone) {
          return res.status(400).json({
            success: false,
            message: 'Customer email and phone number are required'
          });
        }    

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe requires amount in cents
      currency,
      metadata: { orderId, customerId }
    });

    // Save payment to database
    const payment = new Payment({
      orderId,
      amount,
      currency,
      status: 'pending',
      paymentMethod: 'card',
      customerEmail,
      customerPhone,
      stripePaymentId: paymentIntent.id,
      stripeClientSecret: paymentIntent.client_secret,
      customerId
    });

    await payment.save();

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
};

// Confirm payment success
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: `Payment not successful. Status: ${paymentIntent.status}`
      });
    }

    // Update payment record in database
    const payment = await Payment.findOneAndUpdate(
      { stripePaymentId: paymentIntentId },
      { status: 'completed' },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Notify order service about successful payment
    try {
      await axios.post(`${config.orderServiceUrl}/api/orders/payment-complete`, {
        orderId: payment.orderId,
        paymentId: payment._id
      });
    } catch (error) {
      console.error('Failed to update order service:', error);
      // Continue execution, don't fail the request
    }

    // Notify notification service to send payment confirmation
    try {
      await axios.post(`${config.notificationServiceUrl}/api/notifications/payment`, {
        type: 'PAYMENT_SUCCESS',
        orderId: payment.orderId,
        customerId: payment.customerId,
        amount: payment.amount
      });
    } catch (error) {
      console.error('Failed to notify notification service:', error);
      // Continue execution, don't fail the request
    }

    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: error.message
    });
  }
};

// Handle webhook events from Stripe
exports.handleWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    // Verify the webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object;
      await handlePaymentIntentFailed(failedPaymentIntent);
      break;
    // Add more event handlers as needed
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: error.message
    });
  }
};

// Get payment by order ID
exports.getPaymentByOrderId = async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found for this order'
      });
    }

    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Error fetching payment by order ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: error.message
    });
  }
};

// Helper functions for webhook handling
async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    const { id, metadata } = paymentIntent;
    const { orderId } = metadata;

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { stripePaymentId: id },
      { status: 'completed' },
      { new: true }
    );

    if (!payment) {
      console.error(`Payment record not found for Stripe payment ID: ${id}`);
      return;
    }

    // Notify order service
    try {
      await axios.post(`${config.orderServiceUrl}/api/orders/payment-complete`, {
        orderId: payment.orderId,
        paymentId: payment._id
      });
    } catch (error) {
      console.error('Failed to update order service:', error);
    }

    // Notify notification service
    try {
      await axios.post(`${config.notificationServiceUrl}/api/notifications/payment`, {
        type: 'PAYMENT_SUCCESS',
        orderId: payment.orderId,
        customerId: payment.customerId,
        amount: payment.amount
      });
    } catch (error) {
      console.error('Failed to notify notification service:', error);
    }
  } catch (error) {
    console.error('Error handling payment intent succeeded webhook:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent) {
  try {
    const { id, metadata } = paymentIntent;
    const { orderId } = metadata;

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { stripePaymentId: id },
      { status: 'failed' },
      { new: true }
    );

    if (!payment) {
      console.error(`Payment record not found for Stripe payment ID: ${id}`);
      return;
    }

    // Notify order service
    try {
      await axios.post(`${config.orderServiceUrl}/api/orders/payment-failed`, {
        orderId: payment.orderId,
        paymentId: payment._id
      });
    } catch (error) {
      console.error('Failed to update order service about payment failure:', error);
    }

    // Notify notification service
    try {
      await axios.post(`${config.notificationServiceUrl}/api/notifications/payment`, {
        type: 'PAYMENT_FAILED',
        orderId: payment.orderId,
        customerId: payment.customerId,
        amount: payment.amount
      });
    } catch (error) {
      console.error('Failed to notify notification service about payment failure:', error);
    }
  } catch (error) {
    console.error('Error handling payment intent failed webhook:', error);
  }
}