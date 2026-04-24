// Auth helper for pages that include this script
async function handleSocialLogin(provider) {
  window.location.href = api.baseUrl + '/auth/' + provider.toLowerCase();
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const btnGoogle = document.getElementById('btn-google');
  const btnGithub = document.getElementById('btn-github');

  if (btnGoogle) {
    btnGoogle.addEventListener('click', () => handleSocialLogin('Google'));
  }

  if (btnGithub) {
    btnGithub.addEventListener('click', () => handleSocialLogin('GitHub'));
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const response = await api.post('/auth/login', { email, password });
        if (response.success) {
          localStorage.setItem('forgepath_token', response.data.token);
          localStorage.setItem('forgepath_user', JSON.stringify(response.data));
          window.location.href = 'dashboard.html';
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const response = await api.post('/auth/register', { name, email, password });
        if (response.success) {
          localStorage.setItem('forgepath_token', response.data.token);
          localStorage.setItem('forgepath_user', JSON.stringify(response.data));
          window.location.href = 'dashboard.html';
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }
});
