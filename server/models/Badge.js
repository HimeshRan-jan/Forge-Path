const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  iconUrl: { type: String },
  milestoneTrigger: { type: String } // e.g. "First Experiment", "5 Experiments"
}, {
  timestamps: true
});

module.exports = mongoose.model('Badge', badgeSchema);
