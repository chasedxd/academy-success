document.addEventListener('DOMContentLoaded', () => {
  const teacherName = document.getElementById('teacherName');
  const teacherEmail = document.getElementById('teacherEmail');
  const teacherCoursesTbody = document.getElementById('teacherCourses');

  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user || user.role !== 'teacher') {
    window.location.href = 'index.html';
    return;
  }

  teacherName.textContent = user.name;
  teacherEmail.textContent = user.email;

  async function loadCourses() {
    try {
      const res = await fetch(`api/teacher_courses.php?teacher_id=${user.id}`);
      const data = await res.json();

      if (data.status === 'success') {
        teacherCoursesTbody.innerHTML = '';
        data.courses.forEach(course => {
          const tr = document.createElement('tr');

          const nameTd = document.createElement('td');
          nameTd.textContent = course.name;

          const uploadTd = document.createElement('td');
          const uploadBtn = document.createElement('button');
          uploadBtn.textContent = 'Загрузить материал';
          uploadBtn.onclick = () => showUploadForm(course.id);
          uploadTd.appendChild(uploadBtn);

          tr.appendChild(nameTd);
          tr.appendChild(uploadTd);
          teacherCoursesTbody.appendChild(tr);
        });
      } else {
        teacherCoursesTbody.innerHTML = '<tr><td colspan="2">Ошибка загрузки курсов</td></tr>';
      }
    } catch {
      teacherCoursesTbody.innerHTML = '<tr><td colspan="2">Ошибка сети</td></tr>';
    }
  }

  const main = document.querySelector('main');
  const uploadDiv = document.createElement('div');
  uploadDiv.style.marginTop = '20px';
  uploadDiv.style.display = 'none';

  uploadDiv.innerHTML = `
    <h3>Загрузить материал</h3>
    <form id="uploadMaterialForm" enctype="multipart/form-data">
      <input type="hidden" id="uploadCourseId" name="course_id" />
      <input type="file" id="materialFile" name="material" required />
      <button type="submit">Загрузить</button>
    </form>
    <div id="uploadMessage" style="margin-top: 10px;"></div>
  `;

  main.appendChild(uploadDiv);

  const uploadForm = uploadDiv.querySelector('#uploadMaterialForm');
  const uploadMessage = uploadDiv.querySelector('#uploadMessage');

  function showUploadForm(courseId) {
    uploadDiv.style.display = 'block';
    uploadMessage.textContent = '';
    uploadForm.reset();
    uploadForm.querySelector('#uploadCourseId').value = courseId;
    uploadForm.scrollIntoView({behavior: 'smooth'});
  }

  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    uploadMessage.textContent = '';

    const formData = new FormData(uploadForm);

    try {
      const res = await fetch('api/upload_material.php', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (result.status === 'success') {
        uploadMessage.style.color = 'green';
        uploadMessage.textContent = 'Материал успешно загружен.';
        uploadDiv.style.display = 'none';
      } else {
        uploadMessage.style.color = 'red';
        uploadMessage.textContent = result.message || 'Ошибка при загрузке.';
      }
    } catch {
      uploadMessage.style.color = 'red';
      uploadMessage.textContent = 'Ошибка сети или сервера.';
    }
  });

  document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(sessionStorage.getItem('user'));

    if (!user || !user.id || user.role !== 'teacher') {
        console.error('Нет данных преподавателя или неверная роль');
        location.href = 'index.html';
        return;
    }

    const teacherId = user.id;

    try {
        const response = await fetch(`/api/teacher_courses.php?teacher_id=${teacherId}`);
        const data = await response.json();

        if (data.status === 'success') {
            console.log('Курсы преподавателя:', data.courses);

            const tbody = document.querySelector('#teacherCoursesTable tbody');
            if (tbody) {
                tbody.innerHTML = ''; 
                data.courses.forEach(course => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${course.id}</td>
                        <td>${course.name}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        } else {
            console.error('Ошибка загрузки курсов:', data.message);
        }
    } catch (err) {
        console.error('Ошибка запроса курсов:', err);
    }
});


  window.logout = () => {
    sessionStorage.removeItem('user');
    window.location.href = 'index.html';
  };

  loadCourses();
});
