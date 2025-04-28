// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Driver = require('../models/Driver');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      //Get driver from the token
      req.driver = await Driver.findById(decoded.driverId).select('-password');

      if (!req.driver) {
        return res.status(401).json({ message: 'Not authorized, invalid token' });
      }
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };