require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5003,
  mongoURI: process.env.MONGO_URI || 'mongodb://mongodb:27017/food-delivery-payments',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  orderServiceUrl: process.env.ORDER_SERVICE_URL || 'http://order-service:5002',
  notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:5004',
};