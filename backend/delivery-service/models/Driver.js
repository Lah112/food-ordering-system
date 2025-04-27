// models/driver.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  vehicleType: { type: String, enum: ['bike', 'car', 'van'], required: true },
  availability: { type: Boolean, default: true },
  currentLocation: {
    type: {
      type: String,
      default: "Point",
      enum: ["Point"]
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  lastUpdated: Date
}, { timestamps: true });

// Hash the password before saving
driverSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare entered password with the hashed password
driverSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Create geospatial index
driverSchema.index({ currentLocation: "2dsphere" });

module.exports = mongoose.model('Driver', driverSchema);
