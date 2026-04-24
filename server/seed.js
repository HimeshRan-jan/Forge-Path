const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Experiment = require('./models/Experiment');
const Activity = require('./models/Activity');
const Badge = require('./models/Badge');
const connectDB = require('./config/db');

// Utility to generate dates relative to today
const getDaysAgoDate = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
};

const getDaysAgoDateString = (daysAgo) => {
  return getDaysAgoDate(daysAgo).toISOString().split('T')[0];
};

async function seedData() {
  try {
    await connectDB();
    console.log('Clearing old mock data...');

    // Clean up specifically the mock data by our known emails
    const mockEmails = ['beginner@forgepath.demo', 'intermediate@forgepath.demo', 'advanced@forgepath.demo'];
    const usersToDelete = await User.find({ email: { $in: mockEmails } });
    const userIds = usersToDelete.map(u => u._id);

    await User.deleteMany({ _id: { $in: userIds } });
    await Experiment.deleteMany({ userId: { $in: userIds } });
    await Activity.deleteMany({ userId: { $in: userIds } });
    // Wipe all badges and re-seed to ensure clean state
    await Badge.deleteMany({});

    console.log('Seeding Badges...');
    const bFirst = await Badge.create({ name: 'First Experiment', description: 'Completed your very first experiment', iconUrl: '🧪', milestoneTrigger: '1_EXP' });
    const bFive = await Badge.create({ name: '5 Experiments', description: 'Reached 5 completed experiments', iconUrl: '🔥', milestoneTrigger: '5_EXP' });
    const bTen = await Badge.create({ name: '10 Experiments', description: 'Reached 10 completed experiments', iconUrl: '🚀', milestoneTrigger: '10_EXP' });
    const bNode = await Badge.create({ name: 'Node Explorer', description: 'Completed a Node.js experiment', iconUrl: '🟢', milestoneTrigger: 'NODE_EXP' });

    console.log('Seeding Users...');
    const beginner = await User.create({
      name: 'Beginner User',
      email: 'beginner@forgepath.demo',
      password: 'test01', // Will be hashed by pre-save hook
      level: 'Newbie',
      xp: 80,
      badges: [{ badgeId: bFirst._id, earnedAt: getDaysAgoDate(5) }]
    });

    const intermediate = await User.create({
      name: 'Intermediate User',
      email: 'intermediate@forgepath.demo',
      password: 'test02',
      level: 'Builder',
      xp: 450,
      badges: [
        { badgeId: bFirst._id, earnedAt: getDaysAgoDate(20) },
        { badgeId: bFive._id, earnedAt: getDaysAgoDate(5) }
      ]
    });

    const advanced = await User.create({
      name: 'Advanced User',
      email: 'advanced@forgepath.demo',
      password: 'test03',
      level: 'Hacker',
      xp: 1100,
      badges: [
        { badgeId: bFirst._id, earnedAt: getDaysAgoDate(90) },
        { badgeId: bFive._id, earnedAt: getDaysAgoDate(60) },
        { badgeId: bTen._id, earnedAt: getDaysAgoDate(30) },
        { badgeId: bNode._id, earnedAt: getDaysAgoDate(10) }
      ]
    });

    console.log('Seeding Experiments...');

    // --- BEGINNER EXPERIMENTS (1-2) ---
    await Experiment.create([
      {
        userId: beginner._id,
        title: 'Hello World File System',
        technology: 'Node.js',
        status: 'Success',
        difficulty: 'Beginner',
        setupDetails: 'Created simple script using fs module',
        observedOutcome: 'Successfully read and wrote to a text file.',
        tags: ['file-system', 'basics'],
        createdAt: getDaysAgoDate(5)
      },
      {
        userId: beginner._id,
        title: 'First React Component',
        technology: 'React',
        status: 'In Progress',
        difficulty: 'Beginner',
        setupDetails: 'Used Vite to bootstrap a React app',
        observedOutcome: 'Rendered a counter button on screen',
        tags: ['react', 'ui'],
        createdAt: getDaysAgoDate(2)
      }
    ]);

    // --- INTERMEDIATE EXPERIMENTS (5-7) ---
    const intExp = [];
    const techStack = ['Express.js', 'MongoDB', 'Docker', 'React Native', 'Redis', 'NestJS'];
    for (let i = 0; i < 6; i++) {
      intExp.push({
        userId: intermediate._id,
        title: `Integration test #\${i+1} with \${techStack[i]}`,
        technology: techStack[i],
        status: i % 3 === 0 ? 'Failed' : 'Success',
        difficulty: 'Intermediate',
        setupDetails: 'Configured local development environment and ran test cases.',
        observedOutcome: i % 3 === 0 ? 'Encountered unexpected timeout exceptions.' : 'Data persisted correctly with optimal latency.',
        tags: [techStack[i].toLowerCase(), 'integration'],
        createdAt: getDaysAgoDate(25 - (i * 4))
      });
    }
    await Experiment.create(intExp);

    // --- ADVANCED EXPERIMENTS (10-15) ---
    const advExp = [];
    const advancedTopics = ['GraphQL Federation', 'Kafka Event Streaming', 'Kubernetes Cluster', 'WebAssembly Rust', 'PostgreSQL Partitioning'];
    for (let i = 0; i < 12; i++) {
      const topic = advancedTopics[i % advancedTopics.length];
      advExp.push({
        userId: advanced._id,
        title: `Scaling \${topic} Architecture`,
        technology: topic.split(' ')[0],
        status: 'Success',
        difficulty: 'Advanced',
        setupDetails: 'Deployed across 3 node clusters simulating high load.',
        observedOutcome: 'Sustained throughput of 50k req/sec with under 50ms latency.',
        tags: ['architecture', 'scaling', 'performance'],
        createdAt: getDaysAgoDate(100 - (i * 8))
      });
    }
    await Experiment.create(advExp);

    console.log('Seeding Activity Data...');

    // Beginner Activity (3-5 days)
    const begActs = [];
    for (let i = 0; i < 4; i++) {
      begActs.push({ userId: beginner._id, date: getDaysAgoDateString(i + 1), activity_count: Math.floor(Math.random() * 3) + 1 });
    }

    // Intermediate Activity (10-15 days, somewhat spaced)
    const intActs = [];
    for (let i = 0; i < 14; i++) {
      if (i % 2 === 0 || i % 3 === 0) { // Spread it out
        intActs.push({ userId: intermediate._id, date: getDaysAgoDateString(i), activity_count: Math.floor(Math.random() * 4) + 1 });
      }
    }

    // Advanced Activity (30 days continuous streak)
    const advActs = [];
    for (let i = 0; i < 35; i++) {
      advActs.push({ userId: advanced._id, date: getDaysAgoDateString(i), activity_count: Math.floor(Math.random() * 8) + 2 });
    }

    await Activity.insertMany([...begActs, ...intActs, ...advActs]);

    console.log('Database successfully seeded with realistic Forge Path testing data!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed data:', error);
    process.exit(1);
  }
}

seedData();
