// backend/order/routes/restaurantRoutes.js
import express from 'express';
import Restaurant from '../models/Restaurant.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const restaurants = await Restaurant.find({ isOpen: true });
  res.json(restaurants);
});

router.get('/:id', async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
  res.json(restaurant);
});

export default router;
