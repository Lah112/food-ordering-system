// routes/transactionRoutes.js

import express from 'express';
import { getTransactions, getTransactionById } from '../controllers/transactionController.js';

const transactionRouter = express.Router();

// Route to get all transactions
transactionRouter.get('/transactions', getTransactions);

// Route to get a specific transaction by ID
transactionRouter.get('/transactions/:id', getTransactionById);

export default transactionRouter;
