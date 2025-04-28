import express from 'express';
import {
  placeOrder,
  updateOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/place', protect, placeOrder);
router.put('/update/:id', updateOrder);
router.get('/myorders', protect, getUserOrders);
router.get('/all', protect, adminOnly, getAllOrders);
router.put('/status', protect, adminOnly, updateOrderStatus);
router.delete('/delete/:id', deleteOrder);

export default router;