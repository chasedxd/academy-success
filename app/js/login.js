document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const errorDiv = document.getElementById('loginMessage');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

        if (result.status === 'success') {
          const user = result.user;
          sessionStorage.setItem('user', JSON.stringify(user)); 
        if (user.role === 'student') {
          window.location.href = 'student_dashboard.html';
        } else if (user.role === 'teacher') {
          window.location.href = 'teacher_dashboard.html';
        } else {
          errorDiv.textContent = 'Неизвестная роль';
        }
      } 


      if (result.status === 'success') {
        const user = result.user; 
        if (user.role === 'student') {
          window.location.href = 'student_dashboard.html';
        } else if (user.role === 'teacher') {
          window.location.href = 'teacher_dashboard.html';
        } else {
          errorDiv.textContent = 'Неизвестная роль';
        }
      } else {
        errorDiv.textContent = result.message;
      }
    } catch (err) {
      console.error('Login error:', err);
      errorDiv.textContent = 'Ошибка авторизации';
    }
  });
});
