const app = require('./app');
const mongoose = require('mongoose');
const config = require('./config');

// Connect to MongoDB
mongoose.connect(config.mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Start server
const PORT = config.port || 5003;
app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});