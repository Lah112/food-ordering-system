// backend/order/models/Restaurant.js
import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  name: String,
  isOpen: { type: Boolean, default: true },
  menu: [
    {
      name: String,
      price: Number,
    },
  ],
});

export default mongoose.model('Restaurant', restaurantSchema);
