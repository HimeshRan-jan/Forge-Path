const app = require('../server/app');
const connectDB = require('../server/config/db');
const mongoose = require('mongoose');

// Connect to MongoDB
if (mongoose.connection.readyState === 0) {
  connectDB();
}

module.exports = app;
