// backend/order/controllers/orderController.js
import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import User from '../models/User.js'; // Add this import
import { sendOrderConfirmationEmail } from '../utils/emailService.js';

export const placeOrder = async (req, res) => {
  try {
    const { 
      restaurantId, 
      items, 
      deliveryAddress, 
      customerName, 
      email,
      paymentMethod = 'cash',
      specialInstructions = ''
    } = req.body;

    // Validate required fields
    if (!restaurantId || !items || !deliveryAddress || !customerName || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || !restaurant.isOpen) {
      return res.status(400).json({ message: 'Restaurant is closed or not found' });
    }

    if (!['card', 'cash'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const order = await Order.create({
      customer: req.user._id,
      restaurant: restaurant._id,
      items,
      deliveryAddress,
      customerName,
      email,
      totalAmount,
      paymentStatus: 'pending',
      paymentMethod,
      specialInstructions
    });

    // Populate the order with customer details
    const populatedOrder = await Order.findById(order._id).populate('customer', 'email');

    // Send confirmation email
    await sendOrderConfirmationEmail(populatedOrder.customer.email, order);

    res.status(201).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while placing order'
    });
  }
};


export const updateOrder = async (req, res) => {
  try {
    const { items, deliveryAddress } = req.body;
    const { id } = req.params; // Get ID from URL parameter

    // Verify the order exists
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ 
        message: 'Order not found' 
      });
    }

    // Check if order can be updated (status must be Pending)
    if (order.status !== 'Pending') {
      return res.status(400).json({
        message: 'Order cannot be updated after being processed'
      });
    }

    // Update order details
    if (items) {
      order.items = items;
      // Recalculate total if items changed
      order.totalAmount = items.reduce(
        (acc, item) => acc + item.price * item.quantity, 0
      );
    }
    
    if (deliveryAddress) {
      order.deliveryAddress = deliveryAddress;
    }
    
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ 
      message: 'Server error while updating order' 
    });
  }
};

export const getUserOrders = async (req, res) => {
  const orders = await Order.find({ customer: req.user._id }).populate('restaurant', 'name');
  res.json(orders);
};

export const getAllOrders = async (req, res) => {
  const orders = await Order.find().populate('restaurant customer', 'name email');
  res.json(orders);
};

export const updateOrderStatus = async (req, res) => {
  const { orderId, status } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.status = status;
  await order.save();
  res.json({ message: 'Status updated', order });
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params; // Get ID from URL parameter

    // Verify the order exists
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ 
        message: 'Order not found' 
      });
    }

    // Check if order can be deleted (status must be Pending)
    if (order.status !== 'Pending') {
      return res.status(400).json({
        message: 'Order cannot be deleted after being processed'
      });
    }

    // Delete the order
    await Order.findByIdAndDelete(id);
    
    res.json({ 
      message: 'Order deleted successfully',
      deletedOrder: order
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      message: 'Server error while deleting order' 
    });
  }
};
