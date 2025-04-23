const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const paymentRoutes = require('./routes/paymentRoutes');
const config = require('./config');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'payment-service' });
});

// Default error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'An error occurred',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

module.exports = app;