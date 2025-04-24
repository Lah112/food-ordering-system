import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  name: String,
  email: String,
  address: String,
  phone: String,
  ownerName: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Restaurant', restaurantSchema);
