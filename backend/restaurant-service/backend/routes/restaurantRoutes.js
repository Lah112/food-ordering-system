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

// GET: Approved restaurants
router.get('/approved', async (req, res) => {
  const approved = await Restaurant.find({ isApproved: true });
  res.json(approved);
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

// PATCH: Update restaurant details
router.patch('/update/:id', async (req, res) => {
  try {
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedRestaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Remove a restaurant
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedRestaurant = await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ message: 'Restaurant deleted', data: deletedRestaurant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH: Update restaurant availability
router.patch('/update-availability/:id', async (req, res) => {
  try {
    const { availability } = req.body;  // Expecting { availability: true/false }
    const updated = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { availability },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
