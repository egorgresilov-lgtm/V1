/**
 * Ссылка «Админ» в меню + окно ввода пароля перед переходом в admin.html
 */
(function () {
    const ADMIN_PAGE = 'admin.html';

    let modalEl = null;
    let passwordInput = null;
    let errorEl = null;
    let submitBtn = null;

    function closeMobileNav() {
        document.getElementById('hamburger')?.classList.remove('active');
        document.getElementById('navMenu')?.classList.remove('active');
    }

    function buildModal() {
        if (document.getElementById('adminGateOverlay')) return;

        modalEl = document.createElement('div');
        modalEl.id = 'adminGateOverlay';
        modalEl.className = 'admin-gate-overlay';
        modalEl.setAttribute('aria-hidden', 'true');
        modalEl.innerHTML = `
            <div class="admin-gate-dialog" role="dialog" aria-modal="true" aria-labelledby="adminGateTitle">
                <button type="button" class="admin-gate-close" aria-label="Закрыть">&times;</button>
                <h2 id="adminGateTitle">Вход в админ-панель</h2>
                <p class="admin-gate-hint">Введите пароль администратора</p>
                <form id="adminGateForm">
                    <label class="admin-gate-label" for="adminGatePassword">Пароль</label>
                    <input type="password" id="adminGatePassword" class="admin-gate-input"
                           autocomplete="current-password" required minlength="1">
                    <p id="adminGateError" class="admin-gate-error" hidden></p>
                    <div class="admin-gate-actions">
                        <button type="button" class="btn admin-gate-cancel">Отмена</button>
                        <button type="submit" class="btn admin-gate-submit">Войти</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modalEl);

        passwordInput = document.getElementById('adminGatePassword');
        errorEl = document.getElementById('adminGateError');
        submitBtn = modalEl.querySelector('.admin-gate-submit');

        modalEl.querySelector('.admin-gate-close').addEventListener('click', closeModal);
        modalEl.querySelector('.admin-gate-cancel').addEventListener('click', closeModal);
        modalEl.addEventListener('click', (e) => {
            if (e.target === modalEl) closeModal();
        });
        document.getElementById('adminGateForm').addEventListener('submit', (e) => {
            e.preventDefault();
            attemptLogin();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalEl.classList.contains('active')) {
                closeModal();
            }
        });
    }

    function showError(message) {
        if (!errorEl) return;
        errorEl.textContent = message;
        errorEl.hidden = !message;
    }

    function openModal() {
        buildModal();
        showError('');
        if (passwordInput) passwordInput.value = '';
        modalEl.classList.add('active');
        modalEl.setAttribute('aria-hidden', 'false');
        document.body.classList.add('admin-gate-open');
        setTimeout(() => passwordInput?.focus(), 50);
    }

    function closeModal() {
        if (!modalEl) return;
        modalEl.classList.remove('active');
        modalEl.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('admin-gate-open');
    }

    async function attemptLogin() {
        const password = passwordInput?.value ?? '';
        if (!password.trim()) {
            showError('Введите пароль');
            passwordInput?.focus();
            return;
        }

        if (!window.AdminAuth) {
            showError('Ошибка загрузки модуля авторизации');
            return;
        }

        submitBtn.disabled = true;
        showError('');

        const result = await AdminAuth.loginWithPassword(password);
        if (!result.ok) {
            showError(result.error);
            submitBtn.disabled = false;
            return;
        }

        window.location.href = ADMIN_PAGE;
    }

    async function handleAdminNavClick(event) {
        event.preventDefault();
        closeMobileNav();

        if (window.AdminAuth && (await AdminAuth.verifySession())) {
            window.location.href = ADMIN_PAGE;
            return;
        }

        openModal();
    }

    function injectNavLink() {
        const menu = document.querySelector('.nav-menu, #navMenu');
        if (!menu || menu.querySelector('[data-admin-nav]')) return;

        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = ADMIN_PAGE;
        link.textContent = 'Админ';
        link.className = 'nav-admin-link';
        link.setAttribute('data-admin-nav', 'true');
        link.addEventListener('click', handleAdminNavClick);
        li.appendChild(link);
        menu.appendChild(li);
    }

    if (!window.location.pathname.includes('admin.html')) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', injectNavLink);
        } else {
            injectNavLink();
        }
    }
})();
