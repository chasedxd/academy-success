document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');
    const registerForm = document.getElementById('registerForm');
    const registerMessage = document.getElementById('registerMessage');
    const sections = document.querySelectorAll('.section');
    const menu = document.getElementById('menu');
    let coursesData = [];
    let currentPage = 1;
    const rowsPerPage = 5;
    let teachersData = [];

    if (!isAuthenticated() && !['index.html', 'register.html'].includes(window.location.pathname.split('/').pop())) {
        window.location.href = 'index.html';
        return;
    }

    document.addEventListener('DOMContentLoaded', () => {
        checkAuth();
    });
    function showSection(id) {
        sections.forEach(sec => sec.classList.remove('active'));
        const section = document.getElementById(id);
        if (section) section.classList.add('active');
    }

    async function checkAuth(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const text = await res.text(); 
        let data;

        try {
            data = JSON.parse(text); 
        } catch (e) {
            console.error("Login error: невалидный JSON:", text);
            return;
        }

        if (data.status === 'success') {
            if (data.role === 'student') {
                window.location.href = 'student_lk.html';
            } else if (data.role === 'teacher') {
                window.location.href = 'teacher_lk.html';
            } else {
                alert('Неизвестная роль');
            }
        } else {
            alert(data.message || 'Ошибка авторизации');
        }
    } catch (err) {
        console.error("Login error:", err);
    }
}


    function isAdmin() {
    try {
        const userData = localStorage.getItem('user');
        if (!userData) return false;
        const user = JSON.parse(userData);
        return user && user.role === 'admin';
    } catch {
        return false;
    }
}


    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {
            const res = await fetch('api/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await res.json();
            console.log('Login response:', result);
            if (result.status === 'success') {
                sessionStorage.setItem('user', JSON.stringify(result.user));
                checkAuth();
                window.location.href = 'dashboard.html';
            } else {
                loginMessage.textContent = result.message || 'Ошибка авторизации';
            }
        } catch (err) {
            console.error('Login error:', err);
            loginMessage.textContent = 'Ошибка сервера. Проверь консоль.';
        }
    });

    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value.trim();
        const role = document.getElementById('regRole').value;

        if (!name || !email || !password) {
            registerMessage.textContent = 'Пожалуйста, заполните все поля.';
            return;
        }

        try {
            const res = await fetch('api/register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
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
                    sessionStorage.setItem('user', JSON.stringify(loginResult.user));
                    checkAuth();
                    window.location.href = 'dashboard.html';
                } else {
                    showSection('login');
                    loginMessage.textContent = 'Регистрация успешна. Авторизуйтесь.';
                }
            } else {
                registerMessage.textContent = result.message;
            }
        } catch (err) {
            registerMessage.textContent = 'Ошибка при регистрации. Проверь консоль.';
        }
    });

    menu?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href === '#') return;
            if (!isAuthenticated() || (href === 'admin.html' && !isAdmin())) {
                alert('Доступ запрещен. Только для администратора.');
                return;
            }
            window.location.href = href;
        });
    });

   function logout() {
  console.log('Выход выполнен');
  sessionStorage.removeItem('user'); 
  window.location.href = 'index.html'; 
}

window.logout = logout; 



   async function loadCourses() {
    try {
        const response = await fetch('api/courses/get_all.php');
        const text = await response.text();
        console.log('Ответ сервера get_all.php:', text);

        const data = JSON.parse(text);
        if (data.status === 'success') {
            coursesData = data.courses;
            renderCourses();  
        } else {
            console.error('Ошибка загрузки курсов:', data.message);
        }
    } catch (error) {
        console.error('Ошибка при загрузке курсов:', error);
    }
}


    function renderCourses(courses) {
    const tbody = document.querySelector('#courseTable tbody');
    if (!tbody) {
        console.error('Таблица #courseTable tbody не найдена на странице');
        return;
    }
    

       const searchTerm = document.getElementById('courseSearch')?.value.toLowerCase() || '';
    console.log('Search term:', searchTerm);
    const filteredCourses = coursesData.filter(course => course.name.toLowerCase().includes(searchTerm));
    console.log('Filtered courses:', filteredCourses);

    const totalPages = Math.ceil(filteredCourses.length / rowsPerPage);
    currentPage = Math.min(currentPage, totalPages || 1);
    console.log('Total pages:', totalPages, 'Current page:', currentPage);

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedCourses = filteredCourses.slice(start, end);
    console.log('Paginated courses:', paginatedCourses);

    tbody.innerHTML = '';
    if (paginatedCourses.length > 0) {
        paginatedCourses.forEach(course => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="editable" data-field="name" data-id="${course.id}">${course.name || 'Не указано'}</td>
                <td class="editable" data-field="description" data-id="${course.id}">${course.description || 'Не указано'}</td>
                <td class="editable" data-field="price" data-id="${course.id}">${course.price || 'Не указано'}</td>
                <td>
                    ${isAdmin() ? `
                        <button class="delete-btn" data-id="${course.id}">Удалить</button>
                    ` : 'Нет доступа'}
                </td>
            `;
            tbody.appendChild(tr);
        });

        if (isAdmin()) {
            document.querySelectorAll('.editable').forEach(cell => {
                cell.addEventListener('click', async (e) => {
                    const field = e.target.dataset.field;
                    const id = e.target.dataset.id;
                    const newValue = prompt(`Введите новое значение для ${field}:`, e.target.textContent);
                    if (newValue !== null) {
                        try {
                            const course = coursesData.find(c => c.id == id);
                            course[field] = newValue;
                            const res = await fetch('api/courses/edit.php', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id, name: course.name, description: course.description, price: course.price })
                            });
                            if (res.ok) {
                                renderCourses();
                            } else {
                                alert('Ошибка при обновлении');
                            }
                        } catch (err) {
                            console.error('Ошибка при редактировании:', err);
                        }
                    }
                });
            });

            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', () => deleteCourse(button.dataset.id));
            });
        }
    } else {
        tbody.innerHTML = '<tr><td colspan="4">Нет данных</td></tr>';
    }

    const pagination = document.getElementById('pagination');
    if (pagination) {
        pagination.innerHTML = `
            <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Назад</button>
            <span>Страница ${currentPage} из ${totalPages}</span>
            <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Вперёд</button>
        `;
    }
}

window.changePage = function(page) {
    currentPage = page;
    renderCourses();
};

window.sortCourses = function(field) {
    coursesData.sort((a, b) => {
        if (field === 'price') {
            return (a[field] || 0) - (b[field] || 0);
        }
        return (a[field] || '').localeCompare(b[field] || '');
    });
    renderCourses();
};

    async function loadSchedule() {
        try {
            const res = await fetch('api/schedule/get.php');
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const result = await res.json();
            console.log('Schedule result:', result);
            const calendar = document.getElementById('calendar');
            if (!calendar) {
                console.error('Элемент #calendar не найден на странице');
                return;
            }
            if (result.status === 'success' && Array.isArray(result.data)) {
                console.log('Данные для расписания получены, строим таблицу...');
                let table = `
                    <table>
                        <thead><tr><th>Курс</th><th>Преподаватель</th><th>Филиал</th><th>Дата и время</th></tr></thead>
                        <tbody>
                `;
                result.data.forEach(item => {
                    console.log('Добавляем строку в таблицу:', item);
                    table += `
                        <tr>
                            <td>${item.course || 'Не указано'}</td>
                            <td>${item.teacher || 'Не указано'}</td>
                            <td>${item.branch || 'Не указано'}</td>
                            <td>${item.date_time || 'Не указано'}</td>
                        </tr>
                    `;
                });
                table += '</tbody></table>';
                console.log('Таблица готова:', table);
                calendar.innerHTML = table;
                console.log('Таблица вставлена в #calendar');
                const tempDisplay = calendar.style.display;
                calendar.style.display = 'none';
                calendar.offsetHeight;
                calendar.style.display = tempDisplay;
                window.dispatchEvent(new Event('resize'));
            } else {
                console.log('Данные отсутствуют или некорректны, показываем "Нет данных"');
                calendar.innerHTML = '<p>Нет данных</p>';
            }
        } catch (err) {
            console.error('Ошибка при загрузке расписания:', err);
            const calendar = document.getElementById('calendar');
            if (calendar) calendar.innerHTML = '<p>Ошибка загрузки расписания: ' + err.message + '</p>';
        }
    }

        function loadTeacherDashboard() {
            const script = document.createElement('script');
            script.src = 'js/teacher_dashboard.js';
            document.body.appendChild(script);
        }

        function loadStudentDashboard() {
            const script = document.createElement('script');
            script.src = 'js/student_dashboard.js';
            document.body.appendChild(script);
        }

        function setupNavigation(role) {
    const menuItems = document.querySelectorAll('#menu li');

    menuItems.forEach(item => {
        const link = item.querySelector('a');

        if (!link) return;

        const href = link.getAttribute('href');

        if (role === 'student' && ['admin.html', 'teachers.html', 'reports.html'].includes(href)) {
            item.style.display = 'none';
        }

        if (role === 'teacher' && ['admin.html', 'students.html', 'reports.html'].includes(href)) {
            item.style.display = 'none';
        }
        });
    }

        document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

async function checkAuth() {
    try {
        const res = await fetch('/api/check_session.php');
        const data = await res.json();

        if (data.status !== 'success') {
            window.location.href = 'index.html';
            return;
        }

        const role = data.user.role;

        setupNavigation(role);

        if (role === 'student') {
            loadStudentDashboard();
        } else if (role === 'teacher') {
            loadTeacherDashboard();
        } else if (role === 'admin') {
            loadAdminDashboard();
        }
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = 'index.html';
    }
}     

    document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      const res = await fetch('/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.status === 'success') {
        sessionStorage.setItem('user', JSON.stringify(data.user));


        if (data.user.role === 'admin') {
          window.location.href = 'admin_dashboard.html';
        } else if (data.user.role === 'teacher') {
          window.location.href = 'teacher_dashboard.html';
        } else {
          window.location.href = 'student_dashboard.html';
        }
      } else {
        alert(data.message || 'Ошибка входа');
      }
    });
  }

  checkAuth(); 
});

function checkAuth() {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    console.warn('Неавторизован — возврат на index.html');
    location.href = 'index.html';
    return;
  }


  if (user.role === 'admin' && typeof loadAdminDashboard === 'function') {
    loadAdminDashboard();
  } else if (user.role === 'student' && typeof loadStudentDashboard === 'function') {
    loadStudentDashboard(user);
  } else if (user.role === 'teacher' && typeof loadTeacherDashboard === 'function') {
    loadTeacherDashboard(user);
  }
}


    async function loadStudents() {
        try {
            const res = await fetch('api/students/get.php');
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const result = await res.json();
            console.log('Students result:', result);
            const tbody = document.querySelector('#studentTable tbody');
            if (tbody) {
                tbody.innerHTML = '';
                if (result.status === 'success' && Array.isArray(result.data)) {
                    result.data.forEach(student => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${student.name || 'Не указано'}</td>
                            <td>${student.email || 'Не указано'}</td>
                            <td>${student.course_name || 'Не записан'}</td>
                            <td>${student.grade || 'Нет данных'}</td>
                            <td>${isAdmin() ? '<button disabled>Редактировать</button> <button disabled>Удалить</button>' : 'Нет доступа'}</td>
                        `;
                        tbody.appendChild(tr);
                    });
                } else {
                    tbody.innerHTML = '<tr><td colspan="5">Нет данных</td></tr>';
                }
                const table = tbody.closest('table');
                if (table) {
                    const tempDisplay = table.style.display;
                    table.style.display = 'none';
                    table.offsetHeight;
                    table.style.display = tempDisplay;
                    window.dispatchEvent(new Event('resize'));
                }
            } else {
                console.error('Элемент #studentTable tbody не найден');
            }
        } catch (err) {
            console.error('Ошибка при загрузке студентов:', err);
            const tbody = document.querySelector('#studentTable tbody');
            if (tbody) tbody.innerHTML = '<tr><td colspan="5">Ошибка загрузки студентов: ' + err.message + '</td></tr>';
        }
    }

   async function loadTeachers() {
    try {
        const response = await fetch('api/teachers/get.php');
        const text = await response.text();
        console.log('Ответ сервера get.php (преподаватели):', text);

        const data = JSON.parse(text);
        const tbody = document.querySelector('#teacherTable tbody');

        if (data.status === 'success' && Array.isArray(data.data)) {
            teachersData = data.data;
            if (tbody) {
                renderTeachers();  
            } else {
                console.error('Элемент #teacherTable tbody не найден');
            }
        } else {
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="3">Ошибка загрузки преподавателей: ${data.message || 'Неизвестная ошибка'}</td></tr>`;
            }
            console.error('Ошибка загрузки преподавателей:', data.message);
        }
    } catch (error) {
        console.error('Ошибка при загрузке преподавателей:', error);
        const tbody = document.querySelector('#teacherTable tbody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="3">Ошибка загрузки преподавателей: ${error.message}</td></tr>`;
    }
}


    function renderTeachers() {
        const tbody = document.querySelector('#teacherTable tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        if (teachersData.length > 0) {
            teachersData.forEach(teacher => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${teacher.name || 'Не указано'}</td>
                    <td>${teacher.email || 'Не указано'}</td>
                    <td>
                        ${isAdmin() ? `
                            <button class="edit-btn" data-id="${teacher.id || ''}">Редактировать</button>
                            <button class="delete-btn" data-id="${teacher.id || ''}">Удалить</button>
                        ` : 'Нет доступа'}
                    </td>
                `;
                tbody.appendChild(tr);
            });

            if (isAdmin()) {
                document.querySelectorAll('.edit-btn').forEach(button => {
                    button.addEventListener('click', () => editTeacher(button.dataset.id));
                });
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', () => deleteTeacher(button.dataset.id));
                });
            }
        } else {
            tbody.innerHTML = '<tr><td colspan="3">Нет данных</td></tr>';
        }

        const table = tbody.closest('table');
        if (table) {
            const tempDisplay = table.style.display;
            table.style.display = 'none';
            table.offsetHeight;
            table.style.display = tempDisplay;
            window.dispatchEvent(new Event('resize'));
        }
    }

    async function loadReports() {
        try {
            const res = await fetch('api/reports/generate.php');
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const result = await res.json();
            console.log('Reports result:', result);
            const tbody = document.querySelector('#reportTable tbody');
            if (tbody) {
                tbody.innerHTML = '';
                if (result.status === 'success' && Array.isArray(result.data)) {
                    result.data.forEach(report => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${report.name || 'Не указано'}</td>
                            <td>${report.date || 'Не указано'}</td>
                            <td>${report.description || 'Не указано'}</td>
                            <td>${isAdmin() ? '<button>Открыть</button> <button>Удалить</button>' : 'Нет доступа'}</td>
                        `;
                        tbody.appendChild(tr);
                    });
                } else {
                    tbody.innerHTML = '<tr><td colspan="4">Нет данных</td></tr>';
                }
                const table = tbody.closest('table');
                if (table) {
                    const tempDisplay = table.style.display;
                    table.style.display = 'none';
                    table.offsetHeight;
                    table.style.display = tempDisplay;
                    window.dispatchEvent(new Event('resize'));
                }
            } else {
                console.error('Элемент #reportTable tbody не найден');
            }
        } catch (err) {
            console.error('Ошибка при загрузке отчетов:', err);
            const tbody = document.querySelector('#reportTable tbody');
            if (tbody) tbody.innerHTML = '<tr><td colspan="4">Ошибка загрузки отчетов: ' + err.message + '</td></tr>';
        }
    }

    async function loadAdminData() {
        if (!isAdmin()) return;
        await loadCourses();
        await loadTeachers();
    }

    window.addCourse = async function () {
    if (!isAdmin()) {
        alert('Доступ запрещен. Только для администратора.');
        return;
    }

    const name = document.getElementById('newCourseName').value.trim();
    const description = document.getElementById('newCourseDesc').value.trim();
    const price = document.getElementById('newCoursePrice').value.trim();

    if (!name || !description || !price) {
        alert('Заполните все поля');
        return;
    }

    const payload = {
        name: name,
        description: description,
        price: price
    };

    try {
        const res = await fetch("api/courses/add.php", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await res.json();

        if (res.ok && result.status === 'success') {
            loadCourses();
            document.getElementById('newCourseName').value = '';
            document.getElementById('newCourseDesc').value = '';
            document.getElementById('newCoursePrice').value = '';
        } else {
            console.error('Ошибка добавления:', result.message);
            alert('Ошибка при добавлении курса: ' + result.message);
        }
    } catch (err) {
        console.error('Ошибка при добавлении:', err);
        alert('Ошибка при добавлении курса: ' + err.message);
    }
};



    window.addTeacher = async function() {
        if (!isAdmin()) {
            alert('Доступ запрещен. Только для администратора.');
            return;
        }
        const name = document.getElementById('teacherName').value.trim();
        const email = document.getElementById('teacherEmail').value.trim();
        const password = document.getElementById('teacherPassword').value.trim();
        const branch_id = document.getElementById('teacherBranch').value;

        if (name && email && password && branch_id) {
            try {
                const res = await fetch('api/teachers/add.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, branch_id })
                });
                if (res.ok) {
                    loadTeachers();
                    document.getElementById('teacherName').value = '';
                    document.getElementById('teacherEmail').value = '';
                    document.getElementById('teacherPassword').value = '';
                    document.getElementById('teacherBranch').value = '1';
                } else {
                    const result = await res.text();
                    console.error('Ошибка добавления:', result);
                    alert('Ошибка при добавлении преподавателя: ' + result);
                }
            } catch (err) {
                console.error('Ошибка при добавлении:', err);
                alert('Ошибка при добавлении преподавателя: ' + err.message);
            }
        } else {
            alert('Заполните все поля');
        }

    };

    window.editCourse = async function(id) {
        console.log('Редактирование курса с ID:', id);
        if (!isAdmin()) {
            alert('Доступ запрещен. Только для администратора.');
            return;
        }
        const newName = prompt('Введите новое название курса:');
        const newDescription = prompt('Введите новое описание курса:');
        const newPrice = prompt('Введите новую цену курса:');
        if (newName && newDescription && newPrice) {
            try {
                const res = await fetch('api/courses/edit.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, name: newName, description: newDescription, price: newPrice })
                });
                if (res.ok) {
                    loadCourses();
                } else {
                    const result = await res.text();
                    console.error('Ошибка редактирования:', result);
                    alert('Ошибка при редактировании курса: ' + result);
                }
            } catch (err) {
                console.error('Ошибка при редактировании:', err);
                alert('Ошибка при редактировании курса: ' + err.message);
            }
        }
    };

    window.deleteCourse = async function(id) {
        if (!isAdmin()) {
            alert('Доступ запрещен. Только для администратора.');
            return;
        }
        if (confirm(`Удалить курс с ID ${id}?`)) {
            try {
                const res = await fetch(`api/courses/delete.php?id=${id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (res.ok) {
                    await loadCourses();
                    console.log('Курс удален');
                } else {
                    const result = await res.text();
                    console.error('Ошибка удаления:', result);
                    alert('Ошибка при удалении курса: ' + result);
                }
            } catch (err) {
                console.error('Ошибка при удалении:', err);
                alert('Ошибка при удалении курса: ' + err.message);
            }
        }
    };

    window.editTeacher = async function(id) {
        console.log('Редактирование преподавателя с ID:', id);
        if (!isAdmin()) {
            alert('Доступ запрещен. Только для администратора.');
            return;
        }
        const newName = prompt('Введите новое имя преподавателя:');
        const newEmail = prompt('Введите новый email преподавателя:');
        if (newName && newEmail) {
            try {
                const res = await fetch('api/teachers/edit.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, name: newName, email: newEmail })
                });
                if (res.ok) {
                    loadTeachers();
                } else {
                    const result = await res.text();
                    console.error('Ошибка редактирования:', result);
                    alert('Ошибка при редактировании преподавателя: ' + result);
                }
            } catch (err) {
                console.error('Ошибка при редактировании:', err);
                alert('Ошибка при редактировании преподавателя: ' + err.message);
            }
        }
    };

    window.deleteTeacher = async function(id) {
        if (!isAdmin()) {
            alert('Доступ запрещен. Только для администратора.');
            return;
        }
        if (confirm(`Удалить преподавателя с ID ${id}?`)) {
            try {
                const res = await fetch(`api/teachers/delete.php?id=${id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (res.ok) {
                    await loadTeachers();
                    console.log('Преподаватель удален');
                } else {
                    const result = await res.text();
                    console.error('Ошибка удаления:', result);
                    alert('Ошибка при удалении преподавателя: ' + result);
                }
            } catch (err) {
                console.error('Ошибка при удалении:', err);
                alert('Ошибка при удалении преподавателя: ' + err.message);
            }
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        if (!user.role) {
            document.getElementById('studentCabinet').style.display = 'none';
            document.getElementById('teacherCabinet').style.display = 'none';
        } else {
        if (user.role === 'student') {
            document.getElementById('studentCabinet').style.display = 'list-item';
            document.getElementById('teacherCabinet').style.display = 'none';
        } else if (user.role === 'teacher') {
            document.getElementById('studentCabinet').style.display = 'none';
            document.getElementById('teacherCabinet').style.display = 'list-item';
        } else {
            document.getElementById('studentCabinet').style.display = 'none';
        document.getElementById('teacherCabinet').style.display = 'none';
        }
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const dashboardLinkContainer = document.getElementById('userDashboardLink');
    const dashboardLink = document.getElementById('dashboardLink');

    if (user && user.role) {
        dashboardLinkContainer.style.display = 'inline-block';

        if (user.role === 'student') {
            dashboardLink.href = 'student_dashboard.html';
        } else if (user.role === 'teacher') {
            dashboardLink.href = 'teacher_dashboard.html';
        } else {
            dashboardLinkContainer.style.display = 'none';
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const loginMessage = document.getElementById('loginMessage');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
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
          if (result.role === 'student') {
            window.location.href = 'student_dashboard.html';
          } else if (result.role === 'teacher') {
            window.location.href = 'teacher_dashboard.html';
          } else {
            loginMessage.textContent = 'Неизвестная роль пользователя';
          }
        } else {
          loginMessage.textContent = result.message;
        }
      } catch (err) {
        console.error('Login error:', err);
        loginMessage.textContent = 'Ошибка при авторизации. Повторите попытку.';
      }
    });
  }
});





    const pageFromUrl = window.location.pathname.split('/').pop();
    console.log('Current page from URL:', pageFromUrl);
    if (pageFromUrl === 'courses.html') {
        console.log('Loading courses for courses.html');
        loadCourses();
    }
    if (pageFromUrl === 'schedule.html') loadSchedule();
    if (pageFromUrl === 'students.html') loadStudents();
    if (pageFromUrl === 'teachers.html') loadTeachers();
    if (pageFromUrl === 'reports.html') loadReports();
    if (pageFromUrl === 'admin.html') loadAdminData();
    if (pageFromUrl === 'admin.html' && !isAdmin()) {
        window.location.href = 'index.html';
    }

    checkAuth();
});