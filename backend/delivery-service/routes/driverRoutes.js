// routes/driverRoutes.js
const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { protect } = require('../middleware/authMiddleware');


router.get('/verify-token', protect, driverController.verifyToken);
// Register new driver
router.post('/register', driverController.registerDriver);
// Login Driver
router.post('/login', driverController.loginDriver);
// Get available drivers
router.get('/available', driverController.getAvailableDrivers);
// Update driver location
router.post('/:driverId/location', protect, driverController.updateLocation);
// Get driver details
router.get('/:driverId', protect, driverController.getDriver);
// Set driver availability
router.patch('/:driverId/availability', protect, driverController.setAvailability);
// Get driver's current delivery
router.get('/:driverId/current', protect, driverController.getCurrentDelivery);

module.exports = router;
