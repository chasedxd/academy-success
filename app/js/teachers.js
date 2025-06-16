document.addEventListener('DOMContentLoaded', () => {
  const teacherTable = document.getElementById('teacherTable').querySelector('tbody');
  const teacherModal = document.getElementById('teacherModal'); 
  const teacherForm = document.getElementById('teacherForm');  

  async function loadTeachers() {
    try {
      const res = await fetch('api/teachers/get.php', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await res.json();
      if (result.status === 'success') {
        displayTeachers(result.data);
      } else {
        teacherTable.innerHTML = `<tr><td colspan="4">Ошибка загрузки преподавателей: ${result.message}</td></tr>`;
      }
    } catch (err) {
      teacherTable.innerHTML = '<tr><td colspan="4">Ошибка загрузки преподавателей. Попробуйте позже.</td></tr>';
    }
  }

  function displayTeachers(teachers) {
    teacherTable.innerHTML = '';
    teachers.forEach(teacher => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${teacher.name || 'Не указано'}</td>
        <td>${teacher.email || 'Не указано'}</td>
        <td>${teacher.city || 'Не указано'}</td>
        <td><button>Редактировать</button> 
        <button>Удалить</button></td>
      `;
      teacherTable.appendChild(tr);
    });
  }

  window.openTeacherModal = function () {
    if (!teacherModal) return;
    teacherModal.classList.add('active');
    teacherForm.reset();
  };

  window.closeTeacherModal = function () {
    if (!teacherModal) return;
    teacherModal.classList.remove('active');
  };

  teacherForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('teacherName')?.value.trim() || '';
    const email = document.getElementById('teacherEmail')?.value.trim() || '';
    const password = document.getElementById('teacherPassword')?.value.trim() || '';
    const branchId = document.getElementById('teacherBranch')?.value || 0; 

    if (!name || !email || !password || !branchId) {
      alert('Заполните все поля.');
      return;
    }

    try {
      const res = await fetch('api/teachers/add.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, branch_id: branchId })
      });

      const result = await res.json();
      if (result.status === 'success') {
        closeTeacherModal();
        loadTeachers();
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert('Ошибка при добавлении преподавателя.');
    }
  });

  loadTeachers();
});