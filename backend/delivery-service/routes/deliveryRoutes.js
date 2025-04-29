const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

// Create new delivery
router.post('/', deliveryController.createDelivery);

// Get all deliveries
router.get('/', deliveryController.getAllDeliveries);

// Get driver's active deliveries
router.get('/driver/:driverId', deliveryController.getDriverDeliveries);

// Get customer's deliveries
router.get('/customer/:customerId', deliveryController.getCustomerDeliveries);

// Get delivery status
router.get('/:deliveryId', deliveryController.getDeliveryStatus);

// Update delivery status
router.patch('/:deliveryId/status', deliveryController.updateStatus);

module.exports = router;
