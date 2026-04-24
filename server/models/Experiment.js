const mongoose = require('mongoose');

const experimentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  technology: { type: String, required: true },
  framework: { type: String },
  category: { type: String },
  setupDetails: { type: String },
  stepsPerformed: { type: String },
  expectedResult: { type: String },
  observedOutcome: { type: String },
  issuesFaced: { type: String },
  solutionNotes: { type: String },
  tags: [{ type: String }],
  difficulty: { type: String },
  status: { type: String },
  visibility: { type: String, default: 'private' },
  isFavorite: { type: Boolean, default: false }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Experiment', experimentSchema);
