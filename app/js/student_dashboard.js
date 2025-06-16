document.addEventListener("DOMContentLoaded", async () => {
    const coursesTable = document.getElementById('studentCourses');
    const scheduleTable = document.getElementById('studentSchedule');
    const availableCoursesTableBody = document.querySelector('#availableCoursesTable tbody');
    const courseSelect = document.getElementById('courseSelect');
    const enrollMessage = document.getElementById('enrollMessage');
    const enrollForm = document.getElementById('enrollForm');

    const response = await fetch('/api/get_student_info.php');
    const data = await response.json();

    if (data.status !== 'success') {
        alert('Ошибка загрузки данных студента');
        return;
    }

    const student = data.student;


    document.getElementById('studentName').textContent = student.name;
    document.getElementById('studentEmail').textContent = student.email;
    document.getElementById('studentBranch').textContent = student.branch;

    function renderStudentCourses() {
        coursesTable.innerHTML = '';
        student.courses.forEach(course => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${course.name}</td><td>${course.grade ?? '—'}</td>`;
            coursesTable.appendChild(row);
        });
    }

    function renderSchedule() {
        scheduleTable.innerHTML = '';
        student.schedule.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${item.course}</td><td>${item.date_time}</td>`;
            scheduleTable.appendChild(row);
        });
    }

    function renderAvailableCourses(courses) {
        availableCoursesTableBody.innerHTML = '';
        courseSelect.innerHTML = '<option value="">-- Выберите курс --</option>';

        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = course.name;
            courseSelect.appendChild(option);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${course.name}</td>
                <td>${course.description || '—'}</td>
                <td>${course.price || '—'}</td>
                <td><button data-course-id="${course.id}" type="button">Записаться</button></td>
            `;
            availableCoursesTableBody.appendChild(row);
        });
    }

    renderStudentCourses();
    renderSchedule();

    try {
        const res = await fetch('/api/courses/get.php');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const coursesData = await res.json();

        if (coursesData.status !== 'success') {
            enrollMessage.style.color = 'red';
            enrollMessage.textContent = 'Ошибка загрузки доступных курсов: ' + (coursesData.message || 'неизвестная ошибка');
            return;
        }

        renderAvailableCourses(coursesData.data);
    } catch (err) {
        enrollMessage.style.color = 'red';
        enrollMessage.textContent = 'Ошибка при загрузке доступных курсов: ' + err.message;
        console.error(err);
    }

    async function enrollCourse(courseId, courseName) {
        enrollMessage.textContent = '';
        enrollMessage.style.color = 'black';

        try {
            const res = await fetch('/api/enroll.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId })
            });

            const result = await res.json();

            if (result.status === 'success') {
                enrollMessage.style.color = 'green';
                enrollMessage.textContent = result.message;

                student.courses.push({ id: courseId, name: courseName, grade: null });
                renderStudentCourses();

                const rows = [...availableCoursesTableBody.querySelectorAll('tr')];
                for (const row of rows) {
                    const btn = row.querySelector('button[data-course-id]');
                    if (btn && btn.dataset.courseId === courseId) {
                        row.remove();
                        break;
                    }
                }

                const optionToRemove = courseSelect.querySelector(`option[value="${courseId}"]`);
                if (optionToRemove) optionToRemove.remove();

                if (courseSelect.value === courseId) {
                    courseSelect.value = '';
                }
            } else {
                enrollMessage.style.color = 'red';
                enrollMessage.textContent = result.message || 'Ошибка при записи на курс';
            }
        } catch (err) {
            enrollMessage.style.color = 'red';
            enrollMessage.textContent = 'Ошибка при отправке запроса: ' + err.message;
        }
    }

    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user || user.role !== 'student') {
        location.href = 'index.html';
    }


    enrollForm.addEventListener('submit', async e => {
        e.preventDefault();

        const selectedCourseId = courseSelect.value;
        if (!selectedCourseId) {
            enrollMessage.style.color = 'red';
            enrollMessage.textContent = 'Пожалуйста, выберите курс для записи.';
            return;
        }

        const selectedCourseName = courseSelect.options[courseSelect.selectedIndex].text;
        await enrollCourse(selectedCourseId, selectedCourseName);
    });


    availableCoursesTableBody.addEventListener('click', async (e) => {
        if (e.target.tagName === 'BUTTON' && e.target.dataset.courseId) {
            const courseId = e.target.dataset.courseId;
            const courseName = e.target.closest('tr').children[0].textContent;
            await enrollCourse(courseId, courseName);
        }
    });
});

    function logout() {
        sessionStorage.clear();
        location.href = 'index.html';
    }

