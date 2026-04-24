document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAuth()) return;

  try {
    // Fetch dashboard stats and activity data in parallel
    const [statsRes, activityRes] = await Promise.all([
      api.get('/dashboard'),
      api.get('/dashboard/activity')
    ]);

    if (statsRes.success) {
      const stats = statsRes.data;
      updateBasicStats(stats);
      updateGamificationUI(stats);
      updateRecentExperiments(stats);
    }

    if (activityRes.success) {
      const actData = activityRes.data;
      renderActivityHeatmap(actData.activity || {});
      animateValue('currentStreak', actData.currentStreak || 0);
      animateValue('longestStreak', actData.longestStreak || 0);
      animateValue('totalContributions', actData.totalContributions || 0);
    }
  } catch (error) {
    console.error('Dashboard load error:', error);
    showToast('Failed to load dashboard data', 'error');
  }
});

// ═══ BASIC STATS ═══
function updateBasicStats(stats) {
  animateValue('totalExp', stats.totalExperiments || 0);
  
  const el = document.getElementById('successRate');
  if (el) {
    animateValue('successRate', stats.successRate || 0, '%');
  }

  animateValue('recentCount', (stats.recentExperiments || []).length);

  if (stats.userName) {
    const greetEl = document.getElementById('userGreeting');
    if (greetEl) greetEl.textContent = `Hi, ${stats.userName}`;
  }
}

// ═══ GAMIFICATION ═══
function updateGamificationUI(stats) {
  const levelEl = document.getElementById('userLevel');
  const xpEl = document.getElementById('userXp');
  const xpBar = document.getElementById('xpBar');

  if (levelEl) levelEl.textContent = stats.level || 'Newbie';
  if (xpEl) xpEl.textContent = `${stats.xp || 0} XP`;
  
  // XP Progress bar — map to tiers
  const tiers = [
    { name: 'Hacker', xp: 600 },
    { name: 'Builder', xp: 300 },
    { name: 'Explorer', xp: 100 },
    { name: 'Newbie', xp: 0 }
  ];
  
  const xp = stats.xp || 0;
  const currentTierIdx = tiers.findIndex(t => xp >= t.xp);
  const currentTier = tiers[currentTierIdx] || tiers[tiers.length - 1];
  const nextTier = tiers[currentTierIdx - 1];
  
  let progress = 100;
  if (nextTier) {
    const range = nextTier.xp - currentTier.xp;
    const earned = xp - currentTier.xp;
    progress = Math.min(100, Math.round((earned / range) * 100));
  }
  
  if (xpBar) {
    setTimeout(() => { xpBar.style.width = `${progress}%`; }, 300);
  }
}

// ═══ RECENT EXPERIMENTS ═══
function updateRecentExperiments(stats) {
  const container = document.getElementById('recentExperimentsList');
  const experiments = stats.recentExperiments || [];
  
  if (!container) return;
  
  if (experiments.length === 0) {
    container.innerHTML = '<p class="text-secondary text-center py-4">No experiments yet. <a href="add-experiment.html">Create your first one →</a></p>';
    return;
  }
  
  container.innerHTML = experiments.map(exp => `
    <div class="experiment-item" onclick="window.location.href='experiment-details.html?id=${exp._id}'" role="button" tabindex="0">
      <div>
        <h4 style="margin:0;font-size:0.95rem">${escapeHtml(exp.title)}</h4>
        <p class="text-sm text-secondary" style="margin-top:0.2rem">${escapeHtml(exp.technology)}</p>
      </div>
      <span class="badge ${exp.status === 'Success' ? 'badge-success' : exp.status === 'Failed' ? 'badge-danger' : 'badge-primary'}">${escapeHtml(exp.status || 'Draft')}</span>
    </div>
  `).join('');
}

// ═══ ACTIVITY HEATMAP ═══
function renderActivityHeatmap(activityMap) {
  const grid = document.getElementById('heatmapGrid');
  const monthsRow = document.getElementById('heatmapMonths');
  const labelsCol = document.getElementById('heatmapLabels');
  const tooltip = document.getElementById('heatmapTooltip');
  
  if (!grid) return;

  // Generate 52 weeks of dates (going back from today)
  const today = new Date();
  const weeks = [];
  const dayNames = ['Sun', '', 'Tue', '', 'Thu', '', 'Sat'];
  
  // Find the start — go back to the nearest Sunday, then 51 more weeks
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // go to this Sunday
  startDate.setDate(startDate.getDate() - (51 * 7)); // go back 51 weeks
  
  let currentDate = new Date(startDate);
  
  for (let w = 0; w < 52; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const count = activityMap[dateStr] || 0;
      const isFuture = currentDate > today;
      week.push({ date: dateStr, count, isFuture, dayOfWeek: d });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push(week);
  }

  // Render day labels (Mon, Wed, Fri)
  if (labelsCol) {
    labelsCol.innerHTML = dayNames.map(name => 
      `<span>${name}</span>`
    ).join('');
  }

  // Render month labels
  if (monthsRow) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let lastMonth = -1;
    let lastYear = -1;
    let monthHtml = '';
    
    weeks.forEach((week, index) => {
      const firstDay = new Date(week[0].date);
      const month = firstDay.getMonth();
      const year = firstDay.getFullYear();

      if (month !== lastMonth) {
        // Prevent overlapping: if the first week is late in the month, skip this label
        if (index === 0 && firstDay.getDate() > 15) {
          monthHtml += `<span></span>`;
          lastMonth = month;
          lastYear = year;
          return;
        }

        let label = months[month];
        
        // Include year for the first label or when the year changes
        if (lastYear !== -1 && year !== lastYear) {
          label = `${year} ${label}`;
        } else if (index === 0 || (index === 1 && lastMonth === -1)) {
          label = `${year} ${label}`;
        }

        // Indicate current month
        if (month === today.getMonth() && year === today.getFullYear()) {
          label = `${year} ${label} (Present)`;
        }
        
        monthHtml += `<span style="white-space: nowrap;">${label}</span>`;
        lastMonth = month;
        lastYear = year;
      } else {
        monthHtml += `<span></span>`;
      }
    });
    
    monthsRow.innerHTML = monthHtml;
  }

  // Render grid
  grid.innerHTML = '';
  
  weeks.forEach(week => {
    const col = document.createElement('div');
    col.className = 'heatmap-col';
    
    week.forEach(day => {
      const cell = document.createElement('div');
      cell.className = `heatmap-cell level-${getHeatLevel(day.count)}`;
      
      if (day.isFuture) {
        cell.style.opacity = '0.15';
        cell.style.cursor = 'default';
      }
      
      cell.dataset.date = day.date;
      cell.dataset.count = day.count;
      
      // Tooltip events
      cell.addEventListener('mouseenter', (e) => {
        if (day.isFuture) return;
        const d = new Date(day.date + 'T12:00:00');
        const formatted = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        const countText = day.count === 0 ? 'No activity' : `${day.count} contribution${day.count > 1 ? 's' : ''}`;
        tooltip.textContent = `${countText} on ${formatted}`;
        tooltip.style.display = 'block';
        
        const rect = cell.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
      });
      
      cell.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });
      
      col.appendChild(cell);
    });
    
    grid.appendChild(col);
  });
}

function getHeatLevel(count) {
  if (count === 0) return 0;
  if (count <= 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

// ═══ ANIMATED COUNTER ═══
function animateValue(elementId, target, suffix = '') {
  const el = document.getElementById(elementId);
  if (!el) return;
  
  const duration = 1200;
  const start = 0;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * eased);
    
    el.textContent = current + suffix;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}
