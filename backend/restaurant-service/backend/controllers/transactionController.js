// controllers/transactionController.js

import orderModel from '../models/orderModel.js';

// Get all transactions
export const getTransactions = async (req, res) => {
  try {
    // Get all orders where payment status is true
    const transactions = await orderModel.find({ payment: true });

    if (!transactions) {
      return res.status(404).json({ message: "No transactions found" });
    }

    res.status(200).json(transactions); // Send all transaction data as response
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get a specific transaction by ID
export const getTransactionById = async (req, res) => {
  const { id } = req.params;
  try {
    const transaction = await orderModel.findById(id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
