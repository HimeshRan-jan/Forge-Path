const express = require('express');
const router = express.Router();
const passport = require('passport');
const { register, login, logout, getMe, verifyEmail, resetPasswordDirect } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit.middleware');

router.post('/register', register);
router.post('/login', authLimiter, login);
router.post('/verify-email', verifyEmail);
router.put('/reset-password-direct', resetPasswordDirect);
router.post('/logout', logout);
router.get('/me', protect, getMe);

// Social Auth Routes
router.get('/google', 
  (req, res, next) => process.env.GOOGLE_CLIENT_ID ? next() : handleDevOAuth(req, res, 'Google'),
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
  (req, res, next) => process.env.GOOGLE_CLIENT_ID ? next() : handleDevOAuth(req, res, 'Google'),
  passport.authenticate('google', { session: false, failureRedirect: '/login.html?error=unavailable' }),
  (req, res) => {
    res.redirect(`/login.html?token=${req.user.generateToken()}`);
  }
);

router.get('/github', 
  (req, res, next) => process.env.GITHUB_CLIENT_ID ? next() : handleDevOAuth(req, res, 'GitHub'),
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback', 
  (req, res, next) => process.env.GITHUB_CLIENT_ID ? next() : handleDevOAuth(req, res, 'GitHub'),
  passport.authenticate('github', { session: false, failureRedirect: '/login.html?error=unavailable' }),
  (req, res) => {
    res.redirect(`/login.html?token=${req.user.generateToken()}`);
  }
);

// Dev Helper: Simulate social login if keys are missing
async function handleDevOAuth(req, res, provider) {
  console.log(`[DEV MODE] Simulating ${provider} login...`);
  const User = require('../../models/User');
  let user = await User.findOne({ email: `dev_${provider.toLowerCase()}@example.com` });
  if (!user) {
    user = await User.create({
      name: `Dev ${provider} User`,
      email: `dev_${provider.toLowerCase()}@example.com`,
      avatar: `https://ui-avatars.com/api/?name=Dev+${provider}&background=0D8ABC&color=fff`
    });
  }
  res.redirect(`/login.html?token=${user.generateToken()}`);
}

module.exports = router;
