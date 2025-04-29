import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, default: "Food Processing" },
  date: { type: Date, default: Date.now },
  payment: { type: Boolean, default: false },

  // NEW FIELD (safe to add - will not affect old data)
  paymentInfo: {
    id: { type: String },          // Stripe session/payment ID
    status: { type: String },       // paid / failed
    type: { type: String },         // card / cash / UPI
    paidAt: { type: Date },         // when paid
  }
});

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;
