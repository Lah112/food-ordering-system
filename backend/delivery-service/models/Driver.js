const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  vehicleType: { type: String, enum: ['bike', 'car', 'van'], required: true },
  availability: { type: Boolean, default: true },
  currentLocation: {
    lat: Number,
    lng: Number,
    lastUpdated: Date
  }
});

module.exports = mongoose.model('Driver', driverSchema);