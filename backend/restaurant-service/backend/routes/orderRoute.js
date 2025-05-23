import express from 'express'
import authMiddleware from "../middleware/auth.js"
import { listOrders, placeOrder, updateStatus, userOrders, verifyOrder,getFinancialReport } from '../controllers/orderController.js'

const orderRouter = express.Router();

orderRouter.post('/place', authMiddleware, placeOrder)
orderRouter.post('/verify', verifyOrder)
orderRouter.post('/userOrders', userOrders)
orderRouter.get('/list', listOrders)
orderRouter.post('/status', updateStatus)
orderRouter.get('/financial-report', getFinancialReport);

export default orderRouter