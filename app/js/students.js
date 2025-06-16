document.addEventListener('DOMContentLoaded', () => {
    async function loadStudents() {
        try {
            const res = await fetch('api/students/get.php');
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const result = await res.json();
            console.log('Students result:', result);
            const tbody = document.querySelector('#studentTable tbody');
            if (tbody && result.status === 'success') {
                tbody.innerHTML = '';
                result.data.forEach(student => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${student.name || 'Не указано'}</td>
                        <td>${student.email || 'Не указано'}</td>
                        <td>${student.course_name || 'Не записан'}</td>
                        <td>${student.grade || 'Нет данных'}</td>
                        <td><button>Редактировать</button> 
                        <button>Удалить</button></td>
                    `;
                    tbody.appendChild(tr);
                });
            } else if (tbody) {
                tbody.innerHTML = '<tr><td colspan="5">Нет данных</td></tr>';
            }
        } catch (err) {
            console.error('Ошибка при загрузке студентов:', err);
            const tbody = document.querySelector('#studentTable tbody');
            if (tbody) tbody.innerHTML = '<tr><td colspan="5">Ошибка загрузки студентов: ' + err.message + '</td></tr>';
        }
    }

    loadStudents();
});