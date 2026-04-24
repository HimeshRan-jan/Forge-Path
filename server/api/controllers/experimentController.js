const Experiment = require('../../models/Experiment');
const { updateGamification } = require('../services/gamification');

exports.createExperiment = async (req, res) => {
  try {
    const experiment = new Experiment({ ...req.body, userId: req.user._id });
    await experiment.save();
    
    // Trigger Gamification
    await updateGamification(req.user._id, { action: 'add_experiment' });

    res.status(201).json({ success: true, message: 'Experiment created', data: experiment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getExperiments = async (req, res) => {
  try {
    const filters = { userId: req.user._id };
    if (req.query.technology) filters.technology = new RegExp(req.query.technology, 'i');
    if (req.query.status) filters.status = req.query.status;

    let sortOption = { createdAt: -1 };
    if (req.query.sort === 'oldest') sortOption = { createdAt: 1 };
    
    const experiments = await Experiment.find(filters).sort(sortOption);
    res.json({ success: true, message: 'Experiments fetched', data: experiments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getExperimentById = async (req, res) => {
  try {
    const experiment = await Experiment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!experiment) return res.status(404).json({ success: false, message: 'Experiment not found' });
    res.json({ success: true, message: 'Experiment fetched', data: experiment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateExperiment = async (req, res) => {
  try {
    const experiment = await Experiment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!experiment) return res.status(404).json({ success: false, message: 'Experiment not found' });
    res.json({ success: true, message: 'Experiment updated', data: experiment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteExperiment = async (req, res) => {
  try {
    const experiment = await Experiment.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!experiment) return res.status(404).json({ success: false, message: 'Experiment not found' });
    res.json({ success: true, message: 'Experiment deleted', data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
