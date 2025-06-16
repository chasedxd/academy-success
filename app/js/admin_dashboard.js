function showSection(id) {
  document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
  const section = document.getElementById(id);
  if (section) section.style.display = 'block';
}

function logout() {
  sessionStorage.removeItem('user');
  location.href = 'index.html';
}

function loadAdminDashboard() {
  loadCourses();
  loadTeachers();
  loadStudents();
}

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  loadAdminDashboard();

  const courseForm = document.getElementById('courseForm');
  if (courseForm) {
    courseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('courseId').value;
      const name = document.getElementById('courseName').value.trim();
      const description = document.getElementById('courseDescription').value.trim();
      const price = document.getElementById('coursePrice').value;

      const body = { name, description, price };
      const url = id ? `/api/courses/update.php?id=${id}` : '/api/courses/add.php';

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await res.json();
      alert(result.message);
      courseForm.reset();
      loadCourses();
    });
  }

  const teacherForm = document.getElementById('teacherForm');
  if (teacherForm) {
    teacherForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('teacherId').value;
      const name = document.getElementById('teacherName').value.trim();
      const email = document.getElementById('teacherEmail').value.trim();
      const password = document.getElementById('teacherPassword').value;

      const body = { name, email, password, role: 'teacher' };
      const url = id ? `/api/teachers/update.php?id=${id}` : '/api/teachers/add.php';

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await res.json();
      alert(result.message);
      teacherForm.reset();
      loadTeachers();
    });
  }

  const studentForm = document.getElementById('studentForm');
  if (studentForm) {
    studentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('studentId').value;
      const name = document.getElementById('studentName').value.trim();
      const email = document.getElementById('studentEmail').value.trim();
      const password = document.getElementById('studentPassword').value;

      const body = { name, email, password, role: 'student' };
      const url = id ? `/api/students/update.php?id=${id}` : '/api/students/add.php';

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await res.json();
      alert(result.message);
      studentForm.reset();
      loadStudents();
    });
  }
});

async function loadCourses() {
  const res = await fetch('/api/courses/get.php');
  const data = await res.json();
  const list = document.getElementById('courseList');
  if (!list) return;

  list.innerHTML = '';
  if (data.status === 'success') {
    data.data.forEach(course => {
      const div = document.createElement('div');
      div.innerHTML = `
        <strong>${course.name}</strong> — ${course.description} — ${course.price} руб.
        <button onclick="editCourse(${course.id}, '${course.name}', \`${course.description}\`, ${course.price})">✏️</button>
        <button onclick="deleteCourse(${course.id})">🗑️</button>
      `;
      list.appendChild(div);
    });
  }
}

function editCourse(id, name, description, price) {
  document.getElementById('courseId').value = id;
  document.getElementById('courseName').value = name;
  document.getElementById('courseDescription').value = description;
  document.getElementById('coursePrice').value = price;
}

async function deleteCourse(id) {
  if (!confirm('Удалить курс?')) return;
  const res = await fetch(`/api/courses/delete.php?id=${id}`, { method: 'DELETE' });
  const result = await res.json();
  alert(result.message);
  loadCourses();
}

async function loadTeachers() {
  const res = await fetch('/api/teachers/get.php');
  const data = await res.json();
  const list = document.getElementById('teacherList');
  if (!list) return;

  list.innerHTML = '';
  if (data.status === 'success') {
    data.data.forEach(teacher => {
      const div = document.createElement('div');
      div.innerHTML = `
        ${teacher.name} — ${teacher.email}
        <button onclick="editTeacher(${teacher.id}, '${teacher.name}', '${teacher.email}')">✏️</button>
        <button onclick="deleteTeacher(${teacher.id})">🗑️</button>
      `;
      list.appendChild(div);
    });
  }
}

function editTeacher(id, name, email) {
  document.getElementById('teacherId').value = id;
  document.getElementById('teacherName').value = name;
  document.getElementById('teacherEmail').value = email;
}

async function deleteTeacher(id) {
  if (!confirm('Удалить преподавателя?')) return;
  const res = await fetch(`/api/teachers/delete.php?id=${id}`, { method: 'DELETE' });
  const result = await res.json();
  alert(result.message);
  loadTeachers();
}

async function loadStudents() {
  const res = await fetch('/api/students/get.php');
  const data = await res.json();
  const list = document.getElementById('studentList');
  if (!list) return;

  list.innerHTML = '';
  if (data.status === 'success') {
    data.data.forEach(student => {
      const div = document.createElement('div');
      div.innerHTML = `
        ${student.name} — ${student.email}
        <button onclick="editStudent(${student.id}, '${student.name}', '${student.email}')">✏️</button>
        <button onclick="deleteStudent(${student.id})">🗑️</button>
      `;
      list.appendChild(div);
    });
  }
}

function editStudent(id, name, email) {
  document.getElementById('studentId').value = id;
  document.getElementById('studentName').value = name;
  document.getElementById('studentEmail').value = email;
}

async function deleteStudent(id) {
  if (!confirm('Удалить студента?')) return;
  const res = await fetch(`/api/students/delete.php?id=${id}`, { method: 'DELETE' });
  const result = await res.json();
  alert(result.message);
  loadStudents();
}
