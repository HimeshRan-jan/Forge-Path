require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');

const app = express();

// Trust proxy for platforms like Render/Vercel (needed for accurate IPs and HTTPS redirects)
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Passport Config
require('./config/passport')(passport);

// Session Middleware (needed for passport)
app.use(session({
  secret: process.env.JWT_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Serve static frontend files
const path = require('path');
app.use(express.static(path.join(__dirname, '../client')));

// Routes
const authRoutes = require('./api/routes/authRoutes');
const experimentRoutes = require('./api/routes/experimentRoutes');
const dashboardRoutes = require('./api/routes/dashboardRoutes');
const compareRoutes = require('./api/routes/compareRoutes');
const { apiLimiter } = require('./api/middleware/rateLimit.middleware');

// Apply global rate limit to all /api routes
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/experiments', experimentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/compare', compareRoutes);

// Base route - serve landing index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Clean URLs Mapping
const pages = [
  'login', 'signup', 'dashboard', 'experiments', 'add-experiment', 
  'edit-experiment', 'experiment-details', 'compare', 
  'profile', 'about-us', 'manual'
];

pages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(__dirname, `../client/${page}.html`));
  });
});

// Catch-all fallback for SPA-like behavior or unknown routes
app.use((req, res) => {
  // If it's an API route that wasn't caught, let it 404
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API Route Not Found' });
  }
  // Otherwise, fallback to the main entry or login
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error', error: err.message });
});

module.exports = app;
