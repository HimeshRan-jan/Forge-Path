require('dotenv').config();
const mongoose = require('mongoose');
const Badge = require('./models/Badge');

const badges = [
  {
    name: 'First Blood',
    description: 'Documented your very first experiment. The journey begins!',
    iconUrl: '🎖️',
    milestoneTrigger: 'First Experiment'
  },
  {
    name: 'High Five',
    description: 'Completed 5 experiments. You are getting the hang of it.',
    iconUrl: '🖐️',
    milestoneTrigger: '5 Experiments'
  },
  {
    name: 'Perfect Ten',
    description: 'Documented 10 experiments. Consistency is key!',
    iconUrl: '🔟',
    milestoneTrigger: '10 Experiments'
  },
  {
    name: 'Analyst',
    description: 'Used the compare tool to analyze different approaches.',
    iconUrl: '🔍',
    milestoneTrigger: 'Comparator'
  }
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB');
    await Badge.deleteMany(); // Clear existing
    await Badge.insertMany(badges);
    console.log('Badges seeded successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
