const Driver = require('../models/Driver');

module.exports = {
  updateDriverLocation: async (driverId, location) => {
    await Driver.findByIdAndUpdate(driverId, {
      currentLocation: {
        lat: location.lat,
        lng: location.lng,
        lastUpdated: new Date()
      }
    });
  },

  findNearbyDrivers: async (center, maxDistance = 5000) => {
    return Driver.find({
      availability: true,
      'currentLocation': {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [center.lng, center.lat]
          },
          $maxDistance: maxDistance
        }
      }
    });
  }
};