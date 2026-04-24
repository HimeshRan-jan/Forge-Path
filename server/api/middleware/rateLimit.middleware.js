const rateLimit = require('express-rate-limit');

// ═══ GLOBAL API LIMITER ═══
// Applies to all API routes to prevent general abuse and overload
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});

// ═══ AUTH (LOGIN) LIMITER ═══
// Applies specifically to the login route to prevent brute-force password guessing
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many login attempts. Try again later.'
  }
});

module.exports = {
  apiLimiter,
  authLimiter
};
