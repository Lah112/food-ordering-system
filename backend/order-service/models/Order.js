import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  deliveryAddress: String,
  customerName: String,
  email: String,
  totalAmount: Number,
  status: { 
    type: String, 
    default: 'Pending' 
  },
  placedAt: { 
    type: Date, 
    default: Date.now 
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: ["card", "cash"],
    default: "cash",
   
  },
  specialInstructions: { 
    type: String 
  },
  
});

export default mongoose.model('Order', orderSchema);