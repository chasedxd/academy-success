const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');

loginForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch('api/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await res.json();
    if (result.status === 'success') {
      sessionStorage.setItem('user', JSON.stringify(result.user));
      checkAuth();
      window.location.href="dashboard.html";
    } else {
      loginMessage.textContent = result.message;
    }
  } catch (err) {
    loginMessage.textContent = 'Ошибка авторизации. Попробуйте позже.';
  }
});

function checkAuth() {
  const user = JSON.parse(sessionStorage.getItem('user'));
  const menu = document.getElementById('menu');
  const sections = document.querySelectorAll('.section');

  if (user) {
    menu.style.display = 'flex';
    showSection('dashboard');
  } else {
    menu.style.display = 'none';
    showSection('login');
  }
}



function showSection(id) {
  sections.forEach(sec => sec.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

window.logout = function () {
  sessionStorage.removeItem('user');
  checkAuth();
};