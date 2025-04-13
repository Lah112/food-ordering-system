const Driver = require('../models/Driver');
const Delivery = require('../models/Delivery');
const { updateDriverLocation } = require('../services/locationService');

// Register new driver
exports.registerDriver = async (req, res) => {
  try {
    const { name, vehicleType } = req.body;
    
    const driver = new Driver({
      name,
      vehicleType,
      availability: true
    });

    await driver.save();
    res.status(201).json(driver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update driver location
exports.updateLocation = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { lat, lng } = req.body;

    // Update in database
    await updateDriverLocation(driverId, { lat, lng });

    // Notify all active deliveries for this driver
    const activeDeliveries = await Delivery.find({
      driverId,
      status: { $in: ['assigned', 'picked_up', 'in_transit'] }
    });

    // Emit real-time updates
    activeDeliveries.forEach(delivery => {
      req.io.to(delivery._id.toString()).emit('locationUpdate', {
        deliveryId: delivery._id,
        location: { lat, lng },
        driverId
      });
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get driver details
exports.getDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.driverId);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Set driver availability
exports.setAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    const driver = await Driver.findByIdAndUpdate(
      req.params.driverId,
      { availability },
      { new: true }
    );
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all available drivers
exports.getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ availability: true });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get driver's current delivery
exports.getCurrentDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findOne({
      driverId: req.params.driverId,
      status: { $in: ['assigned', 'picked_up', 'in_transit'] }
    }).populate('orderId', 'items totalPrice');

    if (!delivery) {
      return res.status(404).json({ error: 'No active delivery' });
    }

    res.json(delivery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};