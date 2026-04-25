const app = require('./server/app');
const connectDB = require('./server/config/db');
const mongoose = require('mongoose');

// Connect to MongoDB
// In a serverless environment, we check if it's already connected to prevent multiple connections
if (mongoose.connection.readyState === 0) {
  connectDB();
}

module.exports = app;
