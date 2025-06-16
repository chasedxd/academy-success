const registerForm = document.getElementById('registerForm');
const registerMessage = document.getElementById('registerMessage');

document.addEventListener('DOMContentLoaded', () => {
  loadBranches();

  registerForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const role = document.getElementById('regRole').value;
    const branch_id = document.getElementById('branchSelect').value;

    if (!name || !email || !password || (role === 'student' && !branch_id)) {
      registerMessage.textContent = 'Пожалуйста, заполните все поля.';
      return;
    }

    try {
      const res = await fetch('api/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, branch_id })
      });

      const result = await res.json();
      if (result.status === 'success') {
        const loginRes = await fetch('api/login.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const loginResult = await loginRes.json();
        if (loginResult.status === 'success') {
          sessionStorage.setItem('user', JSON.stringify({
            name,
            email,
            role,
            branch_id
          }));

          if (role === 'student') {
            location.href = 'student_dashboard.html';
          } else {
            location.href = 'teacher_dashboard.html';
          }
        } else {
          registerMessage.textContent = 'Ошибка входа после регистрации.';
        }
      } else {
        registerMessage.textContent = result.message || 'Ошибка регистрации.';
      }
    } catch (err) {
      console.error(err);
      registerMessage.textContent = 'Ошибка при регистрации. Попробуйте позже.';
    }
  });
});

async function loadBranches() {
  try {
    const res = await fetch('api/branches/get.php');
    const data = await res.json();
    if (data.status === 'success') {
      const select = document.getElementById('branchSelect');
      data.data.forEach(branch => {
        const option = document.createElement('option');
        option.value = branch.id;
        option.textContent = branch.city;
        select.appendChild(option);
      });
    } else {
      registerMessage.textContent = 'Ошибка загрузки филиалов.';
    }
  } catch (err) {
    registerMessage.textContent = 'Ошибка при загрузке филиалов.';
  }
}

