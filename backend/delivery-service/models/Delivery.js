const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  orderId: {  type: mongoose.Schema.Types.Mixed, 
    default: 1 
  },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  customerId: { 
    type: String,  
    default: "1"
  },
  pickupLocation: { 
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: String
  },
  deliveryLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: String
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Delivery', deliverySchema);
