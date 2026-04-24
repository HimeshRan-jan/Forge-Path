const express = require('express');
const router = express.Router();
const {
  createExperiment,
  getExperiments,
  getExperimentById,
  updateExperiment,
  deleteExperiment
} = require('../controllers/experimentController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createExperiment)
  .get(protect, getExperiments);

router.route('/:id')
  .get(protect, getExperimentById)
  .put(protect, updateExperiment)
  .delete(protect, deleteExperiment);

module.exports = router;
