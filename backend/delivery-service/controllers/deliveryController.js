const Delivery = require('../models/Delivery');
const Driver = require('../models/Driver');
const { findNearbyDrivers } = require('../services/locationService');
const { getRoute } = require('../services/mapboxService');

// Create a new delivery and automatically assign a driver
exports.createDelivery = async (req, res) => {
  try {
    const { pickupLocation, deliveryLocation, orderId, customerId } = req.body;

    const delivery = new Delivery({
      orderId,
      pickupLocation,
      deliveryLocation,
      customerId: String(customerId || "1"),
      status: 'pending'
    });

    await delivery.save();

    const pickupPoint = {
      type: "Point",
      coordinates: [
        parseFloat(delivery.pickupLocation.lng),
        parseFloat(delivery.pickupLocation.lat)
      ]
    };

    const driver = await Driver.findOneAndUpdate(
      {
        availability: true,
        currentLocation: {
          $near: {
            $geometry: pickupPoint
          }
        }
      },
      { $set: { availability: false } },
      { new: true }
    );

    if (!driver) {
      return res.status(201).json(delivery);
    }

    delivery.driverId = driver._id;
    delivery.status = 'assigned';
    await delivery.save();

    const etaMinutes = 30;

    res.status(201).json({
      ...delivery.toObject(),
      driverInfo: {
        _id: driver._id,
        name: driver.name,
        vehicleType: driver.vehicleType
      },
      eta: `${etaMinutes} minutes`
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
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

    req.io.to(delivery._id.toString()).emit('statusUpdate', { 
      status,
      driverName: delivery.driverId?.name 
    });

    if (status === 'delivered' && delivery.driverId) {
      await Driver.findByIdAndUpdate(delivery.driverId._id, {
        availability: true
      });
    }

    res.json(delivery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all deliveries
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


exports.getCustomerDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({
      customerId: String(req.params.customerId)
    })
    .populate('driverId', 'name vehicleType')
    .sort({ createdAt: -1 })
    .lean(); // Use lean() to get plain JavaScript objects

    const deliveriesWithDriverLocation = await Promise.all(
      deliveries.map(async (delivery) => {
        if (delivery.driverId) {
          const driver = await Driver.findById(delivery.driverId._id).select('currentLocation');
          return {
            ...delivery,
            driverId: {
              ...delivery.driverId,
              currentLocation: driver?.currentLocation // Add driver's current location
            }
          };
        }
        return delivery;
      })
    );

    res.json(deliveriesWithDriverLocation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
