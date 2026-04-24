document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAuth()) return;

  try {
    const res = await api.get('/auth/me');
    if (res.success) {
      const user = res.data;
      
      document.getElementById('profileName').textContent = user.name || 'User';
      document.getElementById('profileEmail').textContent = user.email || '';
      document.getElementById('profileLevel').textContent = user.level || 'Newbie';
      document.getElementById('profileXp').textContent = `${user.xp || 0} XP`;
      
      if (user.name) {
        document.getElementById('avatarInitials').textContent = user.name.charAt(0).toUpperCase();
      }

      const milestonesContainer = document.getElementById('profileMilestones');
      if (user.badges && user.badges.length > 0) {
        milestonesContainer.innerHTML = user.badges.map(b => {
          const badge = b.badgeId;
          return `
            <div class="profile-badge-card">
              <span class="badge-emoji">${badge ? badge.iconUrl || '🎖️' : '🎖️'}</span>
              <strong>${escapeHtml(badge ? badge.name : 'Milestone')}</strong>
              ${badge && badge.description ? `<span class="badge-date" title="${escapeHtml(badge.description)}">${escapeHtml(badge.description)}</span>` : ''}
              <span class="badge-date">Earned ${new Date(b.earnedAt).toLocaleDateString()}</span>
            </div>`;
        }).join('');
      } else {
        milestonesContainer.innerHTML = '<p class="text-secondary">No milestones earned yet. Start experimenting to unlock achievements!</p>';
      }
    }
  } catch (error) {
    console.error('Profile load error:', error);
    showToast('Failed to load profile data', 'error');
  }
});
