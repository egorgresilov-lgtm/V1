/**
 * Общая авторизация администратора (пароль + проверка JWT на сервере).
 */
(function (global) {
    const ADMIN_EMAIL = 'admin@buryatia.ru';

    function clearSession() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
    }

    function saveSession(data) {
        if (data.accessToken) {
            localStorage.setItem('authToken', data.accessToken);
        }
        if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
        }
    }

    async function verifySession() {
        const token = localStorage.getItem('authToken');
        if (!token) return false;

        try {
            const response = await fetch('/api/auth/session', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) {
                clearSession();
                return false;
            }
            return true;
        } catch {
            return false;
        }
    }

    async function loginWithPassword(password) {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: ADMIN_EMAIL, password })
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const message =
                data.error === 'Invalid credentials'
                    ? 'Неверный пароль'
                    : data.error || 'Ошибка входа';
            return { ok: false, error: message };
        }

        saveSession(data);
        const valid = await verifySession();
        if (!valid) {
            clearSession();
            return { ok: false, error: 'Нет прав доступа к админ-панели' };
        }

        return { ok: true };
    }

    global.AdminAuth = {
        ADMIN_EMAIL,
        clearSession,
        verifySession,
        loginWithPassword
    };
})(window);
