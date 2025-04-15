const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

// Create new delivery
router.post('/', deliveryController.createDelivery);

// Assign driver to delivery
router.post('/:deliveryId/assign', deliveryController.assignDriver);

// Get delivery status
router.get('/:deliveryId', deliveryController.getDeliveryStatus);

// Update delivery status
router.patch('/:deliveryId/status', deliveryController.updateStatus);

// Get all deliveries
router.get('/', deliveryController.getAllDeliveries);

// Get driver's active deliveries
router.get('/driver/:driverId', deliveryController.getDriverDeliveries);

module.exports = router;