const express = require('express');
const router = express.Router();
const { getDashboardStats, getActivityData } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getDashboardStats);
router.get('/activity', protect, getActivityData);

module.exports = router;
