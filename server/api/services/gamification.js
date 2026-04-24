const User = require('../../models/User');
const Badge = require('../../models/Badge');
const Experiment = require('../../models/Experiment');
const Activity = require('../../models/Activity');

const LEVELS = [
  { name: 'Hacker', xpRequired: 600 },
  { name: 'Builder', xpRequired: 300 },
  { name: 'Explorer', xpRequired: 100 },
  { name: 'Newbie', xpRequired: 0 }
];

const checkAndAwardBadges = async (user, actionData) => {
  const experimentCount = await Experiment.countDocuments({ userId: user._id });
  let newBadgesEarned = false;

  const awardBadge = async (milestone) => {
    const badge = await Badge.findOne({ milestoneTrigger: milestone });
    if (badge) {
      const alreadyHas = user.badges.find(b => b.badgeId.toString() === badge._id.toString());
      if (!alreadyHas) {
        user.badges.push({ badgeId: badge._id });
        newBadgesEarned = true;
      }
    }
  };

  if (experimentCount === 1) await awardBadge('First Experiment');
  if (experimentCount >= 5) await awardBadge('5 Experiments');
  if (experimentCount >= 10) await awardBadge('10 Experiments');

  const hasNode = await Experiment.exists({ userId: user._id, technology: /node/i });
  if (hasNode) await awardBadge('Node Explorer');

  return newBadgesEarned;
};

const updateGamification = async (userId, actionData = null) => {
  try {
    // Explicitly fetching the user with password to ensure it's loaded 
    // and correctly tracked by Mongoose to prevent accidental "modification" detection.
    const user = await User.findById(userId);
    if (!user) return;

    let modified = false;

    // Add XP based on action
    if (actionData && actionData.action === 'add_experiment') {
      user.xp += 50;
      modified = true;
    }
    if (actionData && actionData.action === 'compare') {
      user.xp += 10;
      modified = true;
    }

    // Check Level
    const currentLevel = LEVELS.find(t => user.xp >= t.xpRequired);
    if (currentLevel && currentLevel.name !== user.level) {
      user.level = currentLevel.name;
      modified = true;
    }

    // Check Badges
    const newBadges = await checkAndAwardBadges(user, actionData);
    if (newBadges) modified = true;

    // Track Activity
    const today = new Date().toISOString().split('T')[0];
    await Activity.findOneAndUpdate(
      { userId, date: today },
      { $inc: { activity_count: 1 } },
      { upsert: true, new: true }
    );

    if (modified) {
      await user.save();
      console.log(`[Gamification] Updated stats for user: ${userId}`);
    }
  } catch (err) {
    console.error('Error updating gamification:', err);
  }
};

module.exports = { updateGamification };
