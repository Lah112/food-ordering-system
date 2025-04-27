const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const config = require('./config/default.js');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO first
const io = socketIo(server, {
  cors: {
    origin: config.socket.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
  },
  pingTimeout: 60000, 
  pingInterval: 25000 
});

// Now attach io to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/deliveries', require('./routes/deliveryRoutes'));
app.use('/api/drivers', require('./routes/driverRoutes'));

// Socket.io
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('joinDeliveryRoom', (deliveryId) => {
    socket.join(deliveryId);
    console.log(`Client joined delivery room: ${deliveryId}`);
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});