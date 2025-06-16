function showMessage(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.color = isError ? '#d32f2f' : '#2e7d32';
    }
}

async function fetchData(url, options = {}) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options
        });
        if (!response.ok) throw new Error('Ошибка сети');
        return await response.json();
    } catch (error) {
        console.error(`Ошибка при запросе к ${url}:`, error);
        return { status: 'error', message: error.message };
    }
}

function isAuthenticated() {
    return !!sessionStorage.getItem('user');
}

function getUser() {
    return JSON.parse(sessionStorage.getItem('user') || '{}');
}

function clearSession() {
    sessionStorage.removeItem('user');
}