import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerName: String,
  email: String,
  phone: String,
  address: String,
  cuisineType: String,
  isApproved: { type: Boolean, default: false },
  availability: { type: Boolean, default: true }, // Add this field
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Restaurant', restaurantSchema);
