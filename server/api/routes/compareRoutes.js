const express = require('express');
const router = express.Router();
const { compareExperiments } = require('../controllers/compareController');
const { protect } = require('../middleware/auth');

router.get('/', protect, compareExperiments);

module.exports = router;
