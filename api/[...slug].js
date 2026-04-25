const app = require('../server/app');
const connectDB = require('../server/config/db');
const mongoose = require('mongoose');

// Connect to MongoDB
if (mongoose.connection.readyState === 0) {
  connectDB();
}

module.exports = (req, res) => {
  // Vercel automatically strips the /api prefix for functions in the api/ directory.
  // We add it back so that our Express app's route handlers (e.g., app.use('/api/...')) match correctly.
  if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url === '/' ? '' : req.url}`;
  }
  return app(req, res);
};
