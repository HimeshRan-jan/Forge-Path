// Point directly to the backend to support Live Server dev workflow
const API_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : '/api';

class ApiService {
  constructor() {
    this.baseUrl = API_URL;
  }

  get headers() {
    const token = localStorage.getItem('forgepath_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  async request(endpoint, options = {}) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const text = await response.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
        if (!data.message && data.error) data.message = data.error;
      } catch (e) {
        data = { message: text ? `Server returned invalid JSON on Status ${response.status}` : `Empty response (Status ${response.status})` };
      }
      
      if (!response.ok) {
        // Auto-redirect to login on 401
        if (response.status === 401) {
          localStorage.removeItem('forgepath_token');
          localStorage.removeItem('forgepath_user');
          if (!window.location.pathname.includes('login')) {
            window.location.href = 'login.html';
            return;
          }
        }
        
        throw new Error(data.message || `API request failed with status: ${response.status} ${response.statusText}`);
      }
      
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      console.error('API Error:', error);
      throw error;
    }
  }

  get(endpoint) { return this.request(endpoint); }
  post(endpoint, body) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }); }
  put(endpoint, body) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }); }
  delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); }
}

const api = new ApiService();

// ═══ TOAST NOTIFICATIONS ═══
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);
  if(type === 'success' && (message.includes('XP') || message.includes('Badge') || message.includes('Created') || message.includes('Comparison') || message.includes('created'))) { saveNotification(message); }

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ═══ AUTH UTILITIES ═══
function checkAuth(redirectIfNotLoggedIn = true) {
  const token = localStorage.getItem('forgepath_token');
  if (!token && redirectIfNotLoggedIn) {
    window.location.href = 'login.html';
    return false;
  }
  return !!token;
}

function logout() {
  localStorage.removeItem('forgepath_token');
  localStorage.removeItem('forgepath_user');
  window.location.href = 'login.html';
}

// ═══ MOBILE TOP NAV TOGGLE ═══
function toggleTopNav() {
  const topNav = document.getElementById('topNavLinks');
  if (topNav) topNav.classList.toggle('open');
}

// Close dropdown on click outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-dropdown')) {
    const submenu = document.getElementById('exp-submenu');
    const caret = document.querySelector('.exp-caret');
    if (submenu && submenu.style.display === 'flex') {
      submenu.style.display = 'none';
      if (caret) caret.style.transform = 'rotate(0deg)';
    }
  }
  
  if (!e.target.closest('.noti-container')) {
    const notiDropdown = document.getElementById('notiDropdown');
    if (notiDropdown && notiDropdown.style.display === 'block') {
      notiDropdown.style.display = 'none';
    }
  }
});

// ═══ ESCAPE TEXT (XSS PROTECTION) ═══
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ═══ SIDEBAR MENU TOGGLE ═══
function toggleMyExperiments(event) {
  if (event) event.preventDefault();
  const submenu = document.getElementById('exp-submenu');
  const caret = document.querySelector('.exp-caret');
  
  if (submenu) {
    if (submenu.style.display === 'none') {
      submenu.style.display = 'flex';
      if (caret) caret.style.transform = 'rotate(180deg)';
    } else {
      submenu.style.display = 'none';
      if (caret) caret.style.transform = 'rotate(0deg)';
    }
  }
}

// ═══ GLOBAL NOTIFICATION CHECKER ═══
document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('notify_new_exp')) {
    sessionStorage.removeItem('notify_new_exp');
    showToast('🎉 Created new experiment!');
    setTimeout(() => showToast('⭐ Earned +10 XP!', 'success'), 1200);
    setTimeout(() => showToast('🏆 Earned Badge: Experimenter!', 'success'), 2500);
  }

  if (sessionStorage.getItem('notify_edit_exp')) {
    sessionStorage.removeItem('notify_edit_exp');
    showToast('✅ Experiment updated successfully!');
  }
});


// ═══ NOTIFICATION CENTER (Local Storage) ═══
function getSavedNotifications() {
  const data = localStorage.getItem('forgepath_notifications');
  return data ? JSON.parse(data) : [];
}

function saveNotification(message) {
  const notifications = getSavedNotifications();
  notifications.unshift({ message, time: new Date().toISOString(), read: false });
  if (notifications.length > 20) notifications.pop();
  localStorage.setItem('forgepath_notifications', JSON.stringify(notifications));
  updateNotificationUI();
}

function markNotificationsRead() {
  const notifications = getSavedNotifications().map(n => ({ ...n, read: true }));
  localStorage.setItem('forgepath_notifications', JSON.stringify(notifications));
  updateNotificationUI();
}

function updateNotificationUI() {
  const badge = document.getElementById('notiBadge');
  const list = document.getElementById('notiList');
  if (!badge || !list) return;

  const notifications = getSavedNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  if (unreadCount > 0) {
    badge.style.display = 'block';
    badge.textContent = unreadCount;
  } else {
    badge.style.display = 'none';
  }

  if (notifications.length === 0) {
    list.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No new notifications</div>';
  } else {
    list.innerHTML = notifications.map(n => `
      <div class="noti-item ${n.read ? 'read' : ''}">
        <div class="noti-icon">${n.message.includes('XP') ? '⭐' : n.message.includes('Badge') ? '🏆' : '🎉'}</div>
        <div class="noti-content">
          <p>${escapeHtml(n.message)}</p>
          <small>${new Date(n.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
        </div>
      </div>
    `).join('');
  }
}

function toggleNotiDropdown(e) {
  e.preventDefault();
  const dropdown = document.getElementById('notiDropdown');
  if (dropdown.style.display === 'block') {
    dropdown.style.display = 'none';
  } else {
    dropdown.style.display = 'block';
    markNotificationsRead();
  }
}

document.addEventListener('DOMContentLoaded', updateNotificationUI);
