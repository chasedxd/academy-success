document.addEventListener('DOMContentLoaded', () => {
  const reportForm = document.getElementById('reportForm');
  const reportResult = document.getElementById('reportResult');

  reportForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = document.getElementById('reportType').value;

    try {
      const res = await fetch(`api/reports/generate.php?type=${type}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('Response status:', res.status);
      console.log('Response headers:', Object.fromEntries(res.headers.entries()));
      if (res.ok) {
        const blob = await res.blob();
        console.log('Blob type:', blob.type);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${type}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        reportResult.textContent = 'Отчет успешно сгенерирован и скачан.';
      } else {
        const result = await res.text();
        reportResult.textContent = `Ошибка: ${result}`;
        console.error('Server response:', result);
      }
    } catch (err) {
      reportResult.textContent = 'Ошибка при генерации отчета. Попробуйте позже.';
      console.error('Fetch error:', err);
    }
  });
});