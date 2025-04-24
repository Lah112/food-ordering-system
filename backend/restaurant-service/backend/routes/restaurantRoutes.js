import express from 'express';
import Restaurant from '../models/Restaurant.js';

const router = express.Router();



// POST: Submit application
router.post('/apply', async (req, res) => {
  try {
    const newRestaurant = new Restaurant(req.body);
    await newRestaurant.save();
    res.status(201).json({ message: 'Restaurant application submitted', data: newRestaurant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Unapproved restaurants
router.get('/applications', async (req, res) => {
  try {
    const unapproved = await Restaurant.find({ isApproved: false });
    res.json(unapproved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH: Approve restaurant
router.patch('/approve/:id', async (req, res) => {
  try {
    const updated = await Restaurant.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
