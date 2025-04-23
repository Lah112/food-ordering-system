import express from 'express';
import userModel from '../models/userModel.js';

const router = express.Router();

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await userModel.find({});
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users', error: err });
    }
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
    try {
        await userModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting user', error: err });
    }
});

export default router;
