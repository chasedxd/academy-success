document.addEventListener('DOMContentLoaded', () => {
    async function loadCourses() {
        try {
            const res = await fetch('api/courses/get.php');
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const result = await res.json();
            console.log('Courses result:', result);
            const tbody = document.querySelector('#courseTable tbody');
            if (tbody) {
                tbody.innerHTML = '';
                if (result.status === 'success' && Array.isArray(result.data)) {
                    result.data.forEach(course => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${course.name || 'Не указано'}</td>
                            <td>${course.description || 'Не указано'}</td>
                            <td>${course.price || 'Не указано'}</td>
                            <td><button disabled>Редактировать</button> <button disabled>Удалить</button></td>
                        `;
                        tbody.appendChild(tr);
                    });
                } else {
                    tbody.innerHTML = '<tr><td colspan="4">Нет данных</td></tr>';
                }
            } else {
                console.error('Элемент #courseTable tbody не найден');
            }
        } catch (err) {
            console.error('Ошибка при загрузке курсов:', err);
            const tbody = document.querySelector('#courseTable tbody');
            if (tbody) tbody.innerHTML = '<tr><td colspan="4">Ошибка загрузки курсов: ' + err.message + '</td></tr>';
        }
    }

    loadCourses();
});