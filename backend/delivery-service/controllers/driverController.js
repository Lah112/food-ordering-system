const Driver = require('../models/Driver');
const Delivery = require('../models/Delivery');
const jwt = require('jsonwebtoken');

const { updateDriverLocation } = require('../services/locationService'); // Corrected import path

// Register new driver
exports.registerDriver = async (req, res) => {
  try {
    const { name, email, password, vehicleType, currentLocation } = req.body;

    const existingDriver = await Driver.findOne({ email });
    if (existingDriver) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const driver = new Driver({
      name,
      email,
      password,
      vehicleType,
      availability: true,
      currentLocation: {
        type: "Point",
        coordinates: [currentLocation.lng, currentLocation.lat]
      },
      lastUpdated: new Date()
    });

    await driver.save();

    const token = jwt.sign({ driverId: driver._id, email: driver.email }, process.env.JWT_SECRET, { // Use process.env.JWT_SECRET
      expiresIn: '1h'
    });

    res.status(201).json({ message: 'Driver registered successfully', token, driverId: driver._id, email: driver.email, name: driver.name });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Login driver
exports.loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;

    const driver = await Driver.findOne({ email }).select('+password');
    if (!driver) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordMatch = await driver.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ driverId: driver._id, email: driver.email }, process.env.JWT_SECRET, { // Use process.env.JWT_SECRET
      expiresIn: '1h'
    });

    res.json({ message: 'Driver logged in successfully', token, driverId: driver._id, email: driver.email, name: driver.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update driver location
exports.updateLocation = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { lat, lng } = req.body;

    // Update in database
    const updatedDriver = await Driver.findByIdAndUpdate(driverId, {
      currentLocation: {
        type: "Point",
        coordinates: [lng, lat],
        lastUpdated: new Date()
      }
    }, { new: true }); // Get the updated document

    if (!updatedDriver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

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

    res.json({ success: true, driver: updatedDriver }); // Optionally return the updated driver data
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
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all available drivers
exports.getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ availability: true });
    console.log("Available drivers:", drivers);
    if (drivers.length === 0) {
      return res.status(404).json({ message: 'No available drivers found' });
    }
    res.json(drivers);
  } catch (error) {
    console.error('Error fetching available drivers:', error);
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

// Add this new controller method
exports.verifyToken = async (req, res) => {
  try {
    // 1. Verify JWT
    const decoded = jwt.verify(req.token, process.env.JWT_SECRET);
    
    // 2. Check if driver still exists in DB
    const driver = await Driver.findById(decoded.driverId);
    
    if (!driver) {
      return res.json({ valid: false });
    }
    
    // 3. Return verification result
    res.json({ 
      valid: true,
      driver: {
        id: driver._id,
        email: driver.email,
        name: driver.name
      }
    });
  } catch (error) {
    res.json({ valid: false });
  }
};