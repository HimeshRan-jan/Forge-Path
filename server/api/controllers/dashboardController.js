const Experiment = require('../../models/Experiment');
const User = require('../../models/User');
const Activity = require('../../models/Activity');
const Badge = require('../../models/Badge'); // Pre-register for populate

exports.getDashboardStats = async (req, res) => {
  try {
    const experiments = await Experiment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    
    const totalExperiments = experiments.length;
    const successful = experiments.filter(e => e.status && e.status.toLowerCase() === 'success').length;
    const successRate = totalExperiments === 0 ? 0 : Math.round((successful / totalExperiments) * 100);
    
    // Get fully populated user with badges
    const user = await User.findById(req.user._id).populate('badges.badgeId');

    res.json({
      success: true,
      message: 'Dashboard stats fetched',
      data: {
        totalExperiments,
        successRate,
        xp: user.xp,
        level: user.level,
        badges: user.badges,
        userName: user.name,
        recentExperiments: experiments.slice(0, 5)
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActivityData = async (req, res) => {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const activities = await Activity.find({
      userId: req.user._id,
      date: { $gte: oneYearAgo.toISOString().split('T')[0] }
    }).sort({ date: -1 });

    // Format for heatmap: { "YYYY-MM-DD": count }
    const activityMap = {};
    activities.forEach(a => {
      activityMap[a.date] = a.activity_count;
    });

    // Calculate Streaks
    let currentStreak = 0;
    let longestStreak = 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if streak is still active (today or yesterday)
    let hasRecentActivity = activityMap[today] || activityMap[yesterdayStr];
    
    if (hasRecentActivity) {
      let checkDate = new Date();
      if (!activityMap[today] && activityMap[yesterdayStr]) {
          checkDate.setDate(checkDate.getDate() - 1);
      }
      
      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (activityMap[dateStr]) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Longest Streak
    const sortedDates = Object.keys(activityMap).sort();
    if (sortedDates.length > 0) {
      let streak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const d1 = new Date(sortedDates[i-1]);
        const d2 = new Date(sortedDates[i]);
        const diffTime = Math.abs(d2 - d1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          streak++;
        } else {
          longestStreak = Math.max(longestStreak, streak);
          streak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, streak);
    }
    
    longestStreak = Math.max(longestStreak, currentStreak);

    // Total contributions this year
    const totalContributions = Object.values(activityMap).reduce((sum, c) => sum + c, 0);

    res.json({
      success: true,
      data: {
        activity: activityMap,
        currentStreak,
        longestStreak,
        totalContributions
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
