document.addEventListener('DOMContentLoaded', () => {
    async function loadSchedule() {
        try {
            const res = await fetch('api/schedule/get.php');
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const result = await res.json();
            console.log('Schedule result:', result);
            const calendar = document.getElementById('calendar');
            if (calendar && result.status === 'success') {
                let table = `
                    <table>
                        <thead><tr><th>Курс</th><th>Преподаватель</th><th>Филиал</th><th>Дата и время</th></tr></thead>
                        <tbody>
                `;
                result.data.forEach(item => {
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
                calendar.innerHTML = table;
            } else if (calendar) {
                calendar.innerHTML = '<p>Нет данных</p>';
            }
        } catch (err) {
            console.error('Ошибка при загрузке расписания:', err);
            const calendar = document.getElementById('calendar');
            if (calendar) calendar.innerHTML = '<p>Ошибка загрузки расписания: ' + err.message + '</p>';
        }
    }

    loadSchedule();
});