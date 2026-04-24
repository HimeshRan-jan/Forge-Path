const Experiment = require('../../models/Experiment');
const { updateGamification } = require('../services/gamification');

exports.compareExperiments = async (req, res) => {
  try {
    const { id1, id2 } = req.query;
    if (!id1 || !id2) return res.status(400).json({ success: false, message: 'Bad request: id1 and id2 are required' });

    const exp1 = await Experiment.findOne({ _id: id1, userId: req.user._id });
    const exp2 = await Experiment.findOne({ _id: id2, userId: req.user._id });

    if (!exp1 || !exp2) return res.status(404).json({ success: false, message: 'One or both experiments not found' });

    // Trigger Gamification for using compare module
    await updateGamification(req.user._id, { action: 'compare' });

    res.json({
      success: true,
      message: 'Comparison data fetched',
      data: {
        experiment1: exp1,
        experiment2: exp2
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
