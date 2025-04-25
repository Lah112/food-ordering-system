import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import Restaurant from '../models/Restaurant.js';

dotenv.config(); // Load environment variables

const router = express.Router();

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,     // your Gmail address
    pass: process.env.EMAIL_PASS      // your Gmail App password
  }
});

// POST: Submit application
router.post('/apply', async (req, res) => {
  try {
    const newRestaurant = new Restaurant(req.body);
    await newRestaurant.save();

    // Send confirmation email
    const mailOptions = {
      from: `"බොජුන්" <${process.env.EMAIL_USER}>`,
      to: newRestaurant.email,
      subject: 'Restaurant Application Received',
      html: `
        <div style="font-family: 'Arial', sans-serif; line-height: 1.5;">
          <h2 style="color: #3498db;">Hi ${newRestaurant.ownerName},</h2>
          <p>Thank you for applying to register your restaurant, <strong>${newRestaurant.name}</strong>, on බොජුන්.lk.</p>
          <p>Our team will review your application and get back to you shortly.</p>
          <br/>
          <p>Best regards,<br/>The බොජුන්.lk Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Restaurant application submitted and email sent', data: newRestaurant });
  } catch (err) {
    console.error('Application error:', err);
    res.status(500).json({ error: 'Error submitting application' });
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
  try {
    const approved = await Restaurant.find({ isApproved: true });
    res.json(approved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH: Approve restaurant
router.patch('/approve/:id', async (req, res) => {
  try {
    const updated = await Restaurant.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });

    // Send approval email
    const mailOptions = {
      from: `"බොජුන්" <${process.env.EMAIL_USER}>`,
      to: updated.email,
      subject: 'Your Restaurant Has Been Approved!',
      html: `
        <div style="font-family: 'Arial', sans-serif; line-height: 1.5;">
          <h2 style="color: #2ecc71;">Hi ${updated.ownerName},</h2>
          <p>We're happy to inform you that your restaurant <strong>${updated.name}</strong> has been approved and is now live on බොජුන්.lk.</p>
          <p>You can now receive orders and manage your restaurant through our admin dashboard.</p>
          <br/>
          <p>Cheers,<br/>The බොජුන්.lk Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json(updated);
  } catch (err) {
    console.error('Approval error:', err);
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
    const { availability } = req.body;
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
