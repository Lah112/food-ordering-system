const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');

// Register new driver
router.post('/', driverController.registerDriver);

// Update driver location
router.post('/:driverId/location', driverController.updateLocation);

// Get driver details
router.get('/:driverId', driverController.getDriver);

// Set driver availability
router.patch('/:driverId/availability', driverController.setAvailability);

// Get available drivers
router.get('/available', driverController.getAvailableDrivers);

// Get driver's current delivery
router.get('/:driverId/current', driverController.getCurrentDelivery);

module.exports = router;
