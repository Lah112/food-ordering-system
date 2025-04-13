const Delivery = require('../models/Delivery');
const Driver = require('../models/Driver');
const { findNearbyDrivers } = require('../services/locationService');
const { getRoute } = require('../services/mapboxService');

// Create a new delivery
exports.createDelivery = async (req, res) => {
  try {
    const { pickupLocation, deliveryLocation, orderId } = req.body;
    
    const delivery = new Delivery({
      orderId,
      pickupLocation,
      deliveryLocation,
      status: 'pending'
    });

    await delivery.save();
    res.status(201).json(delivery);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Assign nearest available driver
exports.assignDriver = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.deliveryId);
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    // Find available drivers within 5km radius
    const drivers = await findNearbyDrivers(delivery.pickupLocation);
    if (drivers.length === 0) {
      return res.status(404).json({ error: 'No available drivers nearby' });
    }

    // Assign closest driver (first in the array from $near query)
    const driver = drivers[0];
    delivery.driverId = driver._id;
    delivery.status = 'assigned';
    await delivery.save();

    // Update driver availability
    driver.availability = false;
    await driver.save();

    // Calculate route and ETA
    const route = await getRoute(
      delivery.pickupLocation,
      delivery.deliveryLocation
    );

    // Notify customer through Socket.IO
    req.io.to(delivery._id.toString()).emit('driverAssigned', {
      driverId: driver._id,
      driverName: driver.name,
      vehicleType: driver.vehicleType,
      eta: Math.ceil(route.duration / 60) // Convert to minutes
    });

    res.json({
      success: true,
      delivery,
      driver,
      eta: `${Math.ceil(route.duration / 60)} minutes`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get delivery status
exports.getDeliveryStatus = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.deliveryId)
      .populate('driverId', 'name vehicleType currentLocation');
    
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    res.json(delivery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update delivery status
exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'];

  try {
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const delivery = await Delivery.findByIdAndUpdate(
      req.params.deliveryId,
      { status },
      { new: true }
    ).populate('driverId', 'name');

    // Notify relevant parties
    req.io.to(delivery._id.toString()).emit('statusUpdate', { 
      status,
      driverName: delivery.driverId?.name 
    });

    // If delivered, mark driver as available
    if (status === 'delivered' && delivery.driverId) {
      await Driver.findByIdAndUpdate(
        delivery.driverId._id,
        { availability: true }
      );
    }

    res.json(delivery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all deliveries (for admin dashboard)
exports.getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .populate('driverId', 'name vehicleType')
      .sort({ createdAt: -1 });
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get driver's active deliveries
exports.getDriverDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ 
      driverId: req.params.driverId,
      status: { $in: ['assigned', 'picked_up', 'in_transit'] }
    });
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};