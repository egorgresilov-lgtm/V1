// Admin Panel JavaScript
const API_BASE = '/api';
let authToken = localStorage.getItem('authToken');

// ==========================================
// AUTHENTICATION
// ==========================================

function showLoginForm(message = '') {
    const loginContainer = document.getElementById('loginContainer');
    const adminPanel = document.getElementById('adminPanel');
    const loginError = document.getElementById('loginError');

    if (loginContainer) loginContainer.style.display = 'block';
    if (adminPanel) adminPanel.style.display = 'none';

    if (loginError) {
        loginError.textContent = message;
        loginError.style.display = message ? 'block' : 'none';
    }
}

function showAdminPanel() {
    authToken = localStorage.getItem('authToken');
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadAllData();
}

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('loginPassword')?.value ?? '';
    const loginError = document.getElementById('loginError');
    const submitBtn = document.getElementById('loginSubmitBtn');

    if (!password.trim()) {
        if (loginError) {
            loginError.textContent = 'Введите пароль';
            loginError.style.display = 'block';
        }
        return;
    }

    if (!window.AdminAuth) {
        alert('Ошибка загрузки модуля авторизации');
        return;
    }

    submitBtn.disabled = true;
    if (loginError) loginError.style.display = 'none';

    const result = await AdminAuth.loginWithPassword(password);
    submitBtn.disabled = false;

    if (!result.ok) {
        if (loginError) {
            loginError.textContent = result.error;
            loginError.style.display = 'block';
        }
        return;
    }

    showAdminPanel();
});

async function initAdminAccess() {
    if (window.AdminAuth && (await AdminAuth.verifySession())) {
        showAdminPanel();
        return;
    }
    AdminAuth?.clearSession();
    authToken = null;
    showLoginForm();
}

initAdminAccess();

function getAuthHeaders() {
    authToken = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
    };
}

async function readApiError(response) {
    try {
        const data = await response.json();
        return data.error || `Ошибка ${response.status}`;
    } catch {
        return `Ошибка ${response.status}`;
    }
}

// ==========================================
// TAB NAVIGATION
// ==========================================

document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.admin-content').forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        const tabName = tab.dataset.tab;
        document.getElementById(`${tabName}Tab`).classList.add('active');
    });
});

// ==========================================
// LOAD DATA
// ==========================================

async function loadAllData() {
    loadDestinations();
    loadRoutes();
    loadCommunityTours();
    loadBookings();
    loadReviews();
    loadFacts();
}

async function loadDestinations() {
    try {
        const response = await fetch(`${API_BASE}/destinations`);
        const destinations = await response.json();
        renderDestinationsTable(destinations);
    } catch (error) {
        console.error('Error loading destinations:', error);
    }
}

function renderDestinationsTable(destinations) {
    const tbody = document.getElementById('destinationsTableBody');
    tbody.innerHTML = '';
    
    destinations.forEach(dest => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${dest.id}</td>
            <td>${dest.name_ru}</td>
            <td>${formatDestinationType(dest.color_palette)}</td>
            <td>
                <button class="btn-action btn-edit" onclick="editDestination(${dest.id})">Изменить</button>
                <button class="btn-action btn-delete" onclick="deleteDestination(${dest.id})">Удалить</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function fetchRoutesForAdmin() {
    try {
        const response = await fetch(`${API_BASE}/routes`);
        const text = await response.text();
        const data = JSON.parse(text);
        if (Array.isArray(data)) return data;
    } catch (e) {
        console.warn('API routes unavailable:', e.message);
    }
    const fallback = await fetch('/data/routes.json');
    if (!fallback.ok) throw new Error('Failed to load routes');
    return fallback.json();
}

async function loadRoutes() {
    try {
        const routes = await fetchRoutesForAdmin();
        renderRoutesTable(routes);
    } catch (error) {
        console.error('Error loading routes:', error);
        const tbody = document.getElementById('toursTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6">Не удалось загрузить маршруты. Перезапустите сервер (npm start).</td></tr>';
        }
    }
}

function renderRoutesTable(routes) {
    const tbody = document.getElementById('toursTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    routes.forEach((route) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${route.id}</td>
            <td>${route.slug}</td>
            <td>${route.card_title || route.name}</td>
            <td>${route.duration || '—'}</td>
            <td>${(route.stages || []).length}</td>
            <td>
                <button class="btn-action btn-edit" onclick="editRoute(${route.id})">Изменить</button>
                <button class="btn-action btn-delete" onclick="deleteRoute(${route.id})">Удалить</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

let routeImageObjectUrl = null;

function revokeRouteImageObjectUrl() {
    if (routeImageObjectUrl) {
        URL.revokeObjectURL(routeImageObjectUrl);
        routeImageObjectUrl = null;
    }
}

function setRouteCardImagePreview(url) {
    const wrap = document.getElementById('routeCardImagePreview');
    const img = document.getElementById('routeCardImagePreviewImg');
    const hidden = document.getElementById('routeCardImage');

    if (url) {
        hidden.value = url;
        img.src = url;
        wrap.style.display = 'block';
    } else {
        hidden.value = '';
        img.removeAttribute('src');
        wrap.style.display = 'none';
    }
}

function clearRouteCardImage() {
    const fileInput = document.getElementById('routeCardImageFile');
    if (fileInput) fileInput.value = '';
    revokeRouteImageObjectUrl();
    setRouteCardImagePreview('');
}

let adminDestinationsForRoutes = null;
let routeStageSelections = [];

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text ?? '';
    return div.innerHTML;
}

async function ensureAdminDestinations() {
    if (adminDestinationsForRoutes) return adminDestinationsForRoutes;
    const response = await fetch(`${API_BASE}/destinations`);
    const list = await response.json();
    adminDestinationsForRoutes = list
        .filter((d) => Array.isArray(d.coordinates) && d.coordinates.length >= 2)
        .sort((a, b) => a.name_ru.localeCompare(b.name_ru, 'ru'));
    return adminDestinationsForRoutes;
}

function normalizeRouteStageName(name) {
    return String(name || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function resolveDestinationIdForStage(stage) {
    if (!stage) return '';
    if (stage.destination_id) return String(stage.destination_id);

    const dests = adminDestinationsForRoutes || [];
    const stageNorm = normalizeRouteStageName(stage.name);

    let found = dests.find((d) => normalizeRouteStageName(d.name_ru) === stageNorm);
    if (!found) {
        found = dests.find((d) => {
            const dn = normalizeRouteStageName(d.name_ru);
            return dn.includes(stageNorm) || stageNorm.includes(dn);
        });
    }
    if (!found && stageNorm === 'улан-удэ') {
        found = dests.find((d) => d.name_ru === 'Площадь Советов');
    }
    if (!found && stage.lat != null && stage.lon != null) {
        found = dests.find((d) => {
            return (
                Math.abs(d.coordinates[1] - stage.lat) < 0.05 &&
                Math.abs(d.coordinates[0] - stage.lon) < 0.05
            );
        });
    }

    return found ? String(found.id) : '';
}

function destinationToRouteStage(dest) {
    return {
        destination_id: dest.id,
        name: dest.name_ru,
        lat: dest.coordinates[1],
        lon: dest.coordinates[0],
        desc: dest.description_ru || '',
        img: dest.image_url || ''
    };
}

function buildRouteStageSelectOptions(selectedId) {
    const dests = adminDestinationsForRoutes || [];
    let html = '<option value="">— выберите достопримечательность —</option>';
    dests.forEach((d) => {
        const selected = String(d.id) === String(selectedId) ? ' selected' : '';
        html += `<option value="${d.id}"${selected}>${escapeHtml(d.name_ru)}</option>`;
    });
    return html;
}

function renderRouteStagesEditor() {
    const container = document.getElementById('routeStagesEditor');
    const countInput = document.getElementById('routeStagesCount');
    if (!container || !countInput) return;

    const count = Math.max(0, Math.min(20, Number(countInput.value) || 0));
    countInput.value = count;

    while (routeStageSelections.length < count) routeStageSelections.push('');
    routeStageSelections = routeStageSelections.slice(0, count);

    if (!count) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = routeStageSelections
        .map(
            (destId, index) => `
        <div class="route-stage-row">
            <label>Этап ${index + 1}</label>
            <select class="route-stage-select" data-stage-index="${index}" required>
                ${buildRouteStageSelectOptions(destId)}
            </select>
        </div>
    `
        )
        .join('');

    container.querySelectorAll('.route-stage-select').forEach((select) => {
        select.addEventListener('change', (e) => {
            const idx = Number(e.target.dataset.stageIndex);
            routeStageSelections[idx] = e.target.value;
        });
    });
}

function initRouteStagesFromRoute(route) {
    const stages = route?.stages || [];
    routeStageSelections = stages.map((s) => resolveDestinationIdForStage(s));
    const countInput = document.getElementById('routeStagesCount');
    if (countInput) countInput.value = routeStageSelections.length;
    renderRouteStagesEditor();
}

function resetRouteStagesEditor() {
    routeStageSelections = [];
    const countInput = document.getElementById('routeStagesCount');
    if (countInput) countInput.value = 0;
    renderRouteStagesEditor();
}

function collectRouteStagesFromEditor() {
    const dests = adminDestinationsForRoutes || [];
    const stages = [];

    routeStageSelections.forEach((destId) => {
        if (!destId) return;
        const dest = dests.find((d) => String(d.id) === String(destId));
        if (dest) stages.push(destinationToRouteStage(dest));
    });

    return stages;
}

async function uploadRoutePhoto(file) {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await fetch(`${API_BASE}/upload/route-photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        body: formData
    });

    if (!response.ok) {
        throw new Error(await readApiError(response));
    }

    const data = await response.json();
    return data.url;
}

async function openRouteModal(route = null) {
    const modal = document.getElementById('routeModal');
    const form = document.getElementById('routeForm');
    const slugInput = document.getElementById('routeSlug');
    const fileInput = document.getElementById('routeCardImageFile');

    try {
        await ensureAdminDestinations();
    } catch (error) {
        console.error('Error loading destinations:', error);
        alert('Не удалось загрузить список достопримечательностей');
        return;
    }

    if (route) {
        document.getElementById('routeModalTitle').textContent = 'Редактировать маршрут';
        document.getElementById('routeId').value = route.id;
        slugInput.value = route.slug;
        slugInput.readOnly = true;
        document.getElementById('routeCardTitle').value = route.card_title || '';
        document.getElementById('routeCardBadge').value = route.card_badge || '';
        document.getElementById('routeCardSummary').value = route.card_summary || '';
        document.getElementById('routeName').value = route.name || '';
        document.getElementById('routeDuration').value = route.duration || '';
        document.getElementById('routeDescription').value = route.description || '';
        document.getElementById('routeThemeClass').value = route.theme_class || 'routes-theme-rural';
        if (fileInput) fileInput.value = '';
        setRouteCardImagePreview(route.card_image || '');
        initRouteStagesFromRoute(route);
    } else {
        document.getElementById('routeModalTitle').textContent = 'Добавить маршрут';
        form.reset();
        document.getElementById('routeId').value = '';
        slugInput.readOnly = false;
        document.getElementById('routeThemeClass').value = 'routes-theme-rural';
        clearRouteCardImage();
        resetRouteStagesEditor();
    }

    modal.classList.add('active');
}

function closeRouteModal() {
    document.getElementById('routeModal')?.classList.remove('active');
    revokeRouteImageObjectUrl();
}

async function editRoute(id) {
    try {
        const response = await fetch(`${API_BASE}/routes/${id}`);
        const route = await response.json();
        openRouteModal(route);
    } catch (error) {
        console.error('Error loading route:', error);
        alert('Не удалось загрузить маршрут');
    }
}

async function deleteRoute(id) {
    if (!confirm('Удалить этот маршрут?')) return;

    try {
        const response = await fetch(`${API_BASE}/routes/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            loadRoutes();
            alert('Маршрут удалён');
        } else {
            alert(await readApiError(response));
        }
    } catch (error) {
        console.error('Error deleting route:', error);
        alert('Ошибка подключения');
    }
}

document.getElementById('routeForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('routeId').value;
    const submitBtn = e.submitter || document.querySelector('#routeForm button[type="submit"]');
    const fileInput = document.getElementById('routeCardImageFile');

    const stagesCount = Math.max(0, Number(document.getElementById('routeStagesCount')?.value) || 0);
    const stages = collectRouteStagesFromEditor();

    if (stagesCount > 0 && stages.length !== stagesCount) {
        alert('Выберите достопримечательность для каждого этапа');
        return;
    }

    const data = {
        slug: document.getElementById('routeSlug').value.trim(),
        card_title: document.getElementById('routeCardTitle').value.trim(),
        card_badge: document.getElementById('routeCardBadge').value.trim(),
        card_summary: document.getElementById('routeCardSummary').value.trim(),
        card_image: document.getElementById('routeCardImage').value.trim(),
        name: document.getElementById('routeName').value.trim(),
        duration: document.getElementById('routeDuration').value.trim(),
        description: document.getElementById('routeDescription').value.trim(),
        theme_class: document.getElementById('routeThemeClass').value
    };

    if (stagesCount > 0) {
        data.stages = stages;
    } else if (!id) {
        data.stages = [];
    }

    try {
        if (submitBtn) submitBtn.disabled = true;

        if (fileInput?.files?.[0]) {
            data.card_image = await uploadRoutePhoto(fileInput.files[0]);
        }

        const url = id ? `${API_BASE}/routes/${id}` : `${API_BASE}/routes`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeRouteModal();
            loadRoutes();
            alert('Сохранено успешно!');
        } else {
            alert(await readApiError(response));
        }
    } catch (error) {
        console.error('Error saving route:', error);
        alert(error.message || 'Ошибка подключения');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
});

document.getElementById('routeCardImageFile')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    revokeRouteImageObjectUrl();
    if (!file) return;

    routeImageObjectUrl = URL.createObjectURL(file);
    const img = document.getElementById('routeCardImagePreviewImg');
    const wrap = document.getElementById('routeCardImagePreview');
    img.src = routeImageObjectUrl;
    wrap.style.display = 'block';
});

document.getElementById('routeCardImageRemove')?.addEventListener('click', () => {
    clearRouteCardImage();
});

document.getElementById('routeStagesCount')?.addEventListener('input', renderRouteStagesEditor);
document.getElementById('routeStagesCount')?.addEventListener('change', renderRouteStagesEditor);

document.getElementById('routeModalClose')?.addEventListener('click', closeRouteModal);
document.getElementById('routeModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'routeModal') closeRouteModal();
});

// ==========================================
// COMMUNITY TOURS CRUD
// ==========================================

const CT_DIFFICULTY_LABELS = { easy: 'Лёгкий', medium: 'Средний', hard: 'Высокий' };
const CT_STATUS_LABELS = { published: 'Опубликован', draft: 'Черновик', hidden: 'Скрыт' };

let ctPhotoObjectUrl = null;
let ctPointSelections = [];

function revokeCtPhotoObjectUrl() {
    if (ctPhotoObjectUrl) {
        URL.revokeObjectURL(ctPhotoObjectUrl);
        ctPhotoObjectUrl = null;
    }
}

function setCommunityTourPhotoPreview(url) {
    const wrap = document.getElementById('ctPhotoPreview');
    const img = document.getElementById('ctPhotoPreviewImg');
    const hidden = document.getElementById('ctPhotoUrl');

    if (url) {
        hidden.value = url;
        img.src = url;
        wrap.style.display = 'block';
    } else {
        hidden.value = '';
        img.removeAttribute('src');
        wrap.style.display = 'none';
    }
}

function clearCommunityTourPhoto() {
    const fileInput = document.getElementById('ctPhotoFile');
    if (fileInput) fileInput.value = '';
    revokeCtPhotoObjectUrl();
    setCommunityTourPhotoPreview('');
}

async function loadCommunityTours() {
    const tbody = document.getElementById('communityToursTableBody');
    if (!tbody) return;

    try {
        const response = await fetch(`${API_BASE}/user-tours/admin/list`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            tbody.innerHTML = `<tr><td colspan="7">${await readApiError(response)}</td></tr>`;
            return;
        }

        const tours = await response.json();
        renderCommunityToursTable(tours);
    } catch (error) {
        console.error('Error loading community tours:', error);
        tbody.innerHTML = '<tr><td colspan="7">Не удалось загрузить туры сообщества</td></tr>';
    }
}

function renderCommunityToursTable(tours) {
    const tbody = document.getElementById('communityToursTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!tours.length) {
        tbody.innerHTML = '<tr><td colspan="7">Туров пока нет</td></tr>';
        return;
    }

    tours.forEach((tour) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${tour.id}</td>
            <td>${escapeHtml(tour.title)}</td>
            <td>${tour.duration_days}</td>
            <td>${CT_DIFFICULTY_LABELS[tour.difficulty] || tour.difficulty}</td>
            <td>${CT_STATUS_LABELS[tour.status] || tour.status}</td>
            <td>${tour.views_count ?? 0}</td>
            <td>
                <button class="btn-action btn-edit" onclick="editCommunityTour(${tour.id})">Изменить</button>
                <button class="btn-action btn-delete" onclick="deleteCommunityTour(${tour.id})">Удалить</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function resolveDestinationIdForTourPoint(point) {
    if (!point) return '';
    if (point.destination_id) return String(point.destination_id);

    const dests = adminDestinationsForRoutes || [];
    const pointNorm = normalizeRouteStageName(
        point.destination_name || point.custom_place_name || ''
    );

    let found = dests.find((d) => normalizeRouteStageName(d.name_ru) === pointNorm);
    if (!found && pointNorm) {
        found = dests.find((d) => {
            const dn = normalizeRouteStageName(d.name_ru);
            return dn.includes(pointNorm) || pointNorm.includes(dn);
        });
    }
    if (!found && point.latitude != null && point.longitude != null) {
        found = dests.find((d) => {
            return (
                Math.abs(d.coordinates[1] - point.latitude) < 0.05 &&
                Math.abs(d.coordinates[0] - point.longitude) < 0.05
            );
        });
    }

    return found ? String(found.id) : '';
}

function renderCommunityTourPointsEditor() {
    const container = document.getElementById('ctPointsEditor');
    const countInput = document.getElementById('ctPointsCount');
    if (!container || !countInput) return;

    const count = Math.max(0, Math.min(20, Number(countInput.value) || 0));
    countInput.value = count;

    while (ctPointSelections.length < count) ctPointSelections.push('');
    ctPointSelections = ctPointSelections.slice(0, count);

    if (!count) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = ctPointSelections
        .map(
            (destId, index) => `
        <div class="route-stage-row">
            <label>Точка ${index + 1}</label>
            <select class="ct-point-select" data-point-index="${index}" required>
                ${buildRouteStageSelectOptions(destId)}
            </select>
        </div>
    `
        )
        .join('');

    container.querySelectorAll('.ct-point-select').forEach((select) => {
        select.addEventListener('change', (e) => {
            const idx = Number(e.target.dataset.pointIndex);
            ctPointSelections[idx] = e.target.value;
        });
    });
}

function initCommunityTourPointsFromTour(tour) {
    const points = tour?.points || [];
    ctPointSelections = points.map((p) => resolveDestinationIdForTourPoint(p));
    const countInput = document.getElementById('ctPointsCount');
    if (countInput) countInput.value = ctPointSelections.length;
    renderCommunityTourPointsEditor();
}

function collectCommunityTourPointsFromEditor() {
    const dests = adminDestinationsForRoutes || [];
    const points = [];

    ctPointSelections.forEach((destId, index) => {
        if (!destId) return;
        const dest = dests.find((d) => String(d.id) === String(destId));
        if (!dest) return;

        points.push({
            destination_id: dest.id,
            order_index: index,
            stay_hours: 2
        });
    });

    return points;
}

async function uploadCommunityTourPhoto(file) {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await fetch(`${API_BASE}/upload/tour-photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        body: formData
    });

    if (!response.ok) {
        throw new Error(await readApiError(response));
    }

    const data = await response.json();
    return data.url;
}

function openCommunityTourModal(tour) {
    const modal = document.getElementById('communityTourModal');
    const fileInput = document.getElementById('ctPhotoFile');

    document.getElementById('ctId').value = tour.id;
    document.getElementById('ctTitle').value = tour.title || '';
    document.getElementById('ctShortDesc').value = tour.short_desc || '';
    document.getElementById('ctFullDesc').value = tour.full_desc || '';
    document.getElementById('ctDurationDays').value = tour.duration_days || 1;
    document.getElementById('ctDifficulty').value = tour.difficulty || 'medium';
    document.getElementById('ctSeason').value = tour.season || 'year-round';
    document.getElementById('ctPrice').value = tour.price != null ? tour.price : '';

    if (fileInput) fileInput.value = '';
    setCommunityTourPhotoPreview(tour.main_photo_url || '');
    initCommunityTourPointsFromTour(tour);

    modal.classList.add('active');
}

function closeCommunityTourModal() {
    document.getElementById('communityTourModal')?.classList.remove('active');
    revokeCtPhotoObjectUrl();
}

async function editCommunityTour(id) {
    try {
        await ensureAdminDestinations();

        const response = await fetch(`${API_BASE}/user-tours/community/${id}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            alert(await readApiError(response));
            return;
        }

        const tour = await response.json();
        openCommunityTourModal(tour);
    } catch (error) {
        console.error('Error loading community tour:', error);
        alert('Не удалось загрузить тур');
    }
}

async function deleteCommunityTour(id) {
    if (!confirm('Удалить этот тур сообщества?')) return;

    try {
        const response = await fetch(`${API_BASE}/user-tours/community/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            loadCommunityTours();
            alert('Тур удалён');
        } else {
            alert(await readApiError(response));
        }
    } catch (error) {
        console.error('Error deleting community tour:', error);
        alert('Ошибка подключения');
    }
}

document.getElementById('communityTourForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('ctId').value;
    const submitBtn = e.submitter || document.querySelector('#communityTourForm button[type="submit"]');
    const fileInput = document.getElementById('ctPhotoFile');

    const pointsCount = Math.max(0, Number(document.getElementById('ctPointsCount')?.value) || 0);
    const points = collectCommunityTourPointsFromEditor();
    if (pointsCount > 0 && points.length !== pointsCount) {
        alert('Выберите достопримечательность для каждой точки маршрута');
        return;
    }

    const priceRaw = document.getElementById('ctPrice').value.trim();
    const tour = {
        title: document.getElementById('ctTitle').value.trim(),
        short_desc: document.getElementById('ctShortDesc').value.trim(),
        full_desc: document.getElementById('ctFullDesc').value.trim(),
        duration_days: Number(document.getElementById('ctDurationDays').value),
        difficulty: document.getElementById('ctDifficulty').value,
        season: document.getElementById('ctSeason').value,
        main_photo_url: document.getElementById('ctPhotoUrl').value.trim() || null,
        price: priceRaw === '' ? null : Number(priceRaw)
    };

    try {
        if (submitBtn) submitBtn.disabled = true;

        if (fileInput?.files?.[0]) {
            tour.main_photo_url = await uploadCommunityTourPhoto(fileInput.files[0]);
        }

        const response = await fetch(`${API_BASE}/user-tours/community/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ tour, points })
        });

        if (response.ok) {
            closeCommunityTourModal();
            loadCommunityTours();
            alert('Сохранено успешно!');
        } else {
            alert(await readApiError(response));
        }
    } catch (error) {
        console.error('Error saving community tour:', error);
        alert(error.message || 'Ошибка подключения');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
});

document.getElementById('ctPhotoFile')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    revokeCtPhotoObjectUrl();
    if (!file) return;

    ctPhotoObjectUrl = URL.createObjectURL(file);
    const img = document.getElementById('ctPhotoPreviewImg');
    const wrap = document.getElementById('ctPhotoPreview');
    img.src = ctPhotoObjectUrl;
    wrap.style.display = 'block';
});

document.getElementById('ctPhotoRemove')?.addEventListener('click', () => {
    clearCommunityTourPhoto();
});
document.getElementById('ctPointsCount')?.addEventListener('input', renderCommunityTourPointsEditor);
document.getElementById('ctPointsCount')?.addEventListener('change', renderCommunityTourPointsEditor);

document.getElementById('communityTourModalClose')?.addEventListener('click', closeCommunityTourModal);
document.getElementById('communityTourModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'communityTourModal') closeCommunityTourModal();
});

async function loadBookings() {
    try {
        const response = await fetch(`${API_BASE}/bookings`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const bookings = await response.json();
        renderBookingsTable(bookings);
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

function renderBookingsTable(bookings) {
    const tbody = document.getElementById('bookingsTableBody');
    tbody.innerHTML = '';
    
    bookings.forEach(booking => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${booking.id}</td>
            <td>${booking.full_name}</td>
            <td>${booking.email}</td>
            <td>${booking.tour_title || 'N/A'}</td>
            <td>${new Date(booking.booking_date).toLocaleDateString()}</td>
            <td>${booking.status}</td>
            <td>
                <button class="btn-action btn-approve" onclick="updateBookingStatus(${booking.id}, 'confirmed')">Подтвердить</button>
                <button class="btn-action btn-delete" onclick="updateBookingStatus(${booking.id}, 'cancelled')">Отменить</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function loadReviews() {
    try {
        const response = await fetch(`${API_BASE}/reviews`);
        const reviews = await response.json();
        renderReviewsTable(reviews);
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

function renderReviewsTable(reviews) {
    const tbody = document.getElementById('reviewsTableBody');
    tbody.innerHTML = '';
    
    reviews.forEach(review => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${review.id}</td>
            <td>${review.author}</td>
            <td>${'★'.repeat(review.rating)}</td>
            <td>${review.status}</td>
            <td>
                <button class="btn-action btn-approve" onclick="moderateReview(${review.id}, 'approved')">Одобрить</button>
                <button class="btn-action btn-delete" onclick="moderateReview(${review.id}, 'rejected')">Отклонить</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function loadFacts() {
    try {
        const response = await fetch(`${API_BASE}/facts`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const facts = await response.json();
        renderFactsTable(facts);
    } catch (error) {
        console.error('Error loading facts:', error);
    }
}

function renderFactsTable(facts) {
    const tbody = document.getElementById('factsTableBody');
    tbody.innerHTML = '';
    
    facts.forEach(fact => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${fact.id}</td>
            <td>${fact.fact_ru.substring(0, 50)}...</td>
            <td>${fact.is_active ? 'Да' : 'Нет'}</td>
            <td>
                <button class="btn-action btn-edit">Изменить</button>
                <button class="btn-action btn-delete">Удалить</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ==========================================
// DESTINATIONS CRUD
// ==========================================

// Как на странице достопримечательностей (фильтры color_palette)
const DESTINATION_TYPES = {
    baikal: 'Байкал',
    datsan: 'Места силы',
    villages: 'Сёла',
    steppe: 'Природные места',
    sun: 'Улан-Удэ'
};

function formatDestinationType(palette) {
    return DESTINATION_TYPES[palette] || '—';
}

let destImageObjectUrl = null;

function revokeDestImageObjectUrl() {
    if (destImageObjectUrl) {
        URL.revokeObjectURL(destImageObjectUrl);
        destImageObjectUrl = null;
    }
}

function setDestinationImagePreview(url) {
    const wrap = document.getElementById('destImagePreview');
    const img = document.getElementById('destImagePreviewImg');
    const hidden = document.getElementById('destImageUrl');

    if (url) {
        hidden.value = url;
        img.src = url;
        wrap.style.display = 'block';
    } else {
        hidden.value = '';
        img.removeAttribute('src');
        wrap.style.display = 'none';
    }
}

function clearDestinationImage() {
    const fileInput = document.getElementById('destImageFile');
    if (fileInput) fileInput.value = '';
    revokeDestImageObjectUrl();
    setDestinationImagePreview('');
}

let destPickerMap = null;
let destPickerMarkerLayer = null;
let destPickerMarker = null;
let destPickerCoords = null;

const DEST_MAP_CENTER = [108.0, 52.0];
const DEST_MAP_ZOOM = 7;

function destroyDestMapPicker() {
    if (destPickerMap) {
        destPickerMap.setTarget(null);
        destPickerMap = null;
    }
    destPickerMarkerLayer = null;
    destPickerMarker = null;
}

function updateDestCoordsDisplay() {
    const el = document.getElementById('destCoordsDisplay');
    if (!el) return;

    if (destPickerCoords) {
        el.textContent = `Широта: ${destPickerCoords.lat.toFixed(5)}, долгота: ${destPickerCoords.lon.toFixed(5)}`;
    } else {
        el.textContent = 'Метка не установлена — кликните по карте';
    }
}

function setDestPickerMarker(lon, lat, fitView = false) {
    if (!destPickerMarkerLayer || !window.ol) return;

    destPickerCoords = { lon, lat };
    const projected = ol.proj.fromLonLat([lon, lat]);

    if (!destPickerMarker) {
        destPickerMarker = new ol.Feature({ geometry: new ol.geom.Point(projected) });
        destPickerMarker.setStyle(
            new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 9,
                    fill: new ol.style.Fill({ color: '#2980b9' }),
                    stroke: new ol.style.Stroke({ color: '#ffffff', width: 3 })
                })
            })
        );
        destPickerMarkerLayer.getSource().addFeature(destPickerMarker);
    } else {
        destPickerMarker.getGeometry().setCoordinates(projected);
    }

    updateDestCoordsDisplay();

    if (fitView && destPickerMap) {
        destPickerMap.getView().animate({ center: projected, zoom: 11, duration: 350 });
    }
}

function clearDestPickerMarker() {
    destPickerCoords = null;
    if (destPickerMarker && destPickerMarkerLayer) {
        destPickerMarkerLayer.getSource().removeFeature(destPickerMarker);
        destPickerMarker = null;
    }
    updateDestCoordsDisplay();
}

function initDestMapPicker(initialCoords) {
    if (!window.ol) {
        console.warn('OpenLayers not loaded');
        return;
    }

    destroyDestMapPicker();

    const target = document.getElementById('destMapPicker');
    if (!target) return;

    destPickerMarkerLayer = new ol.layer.Vector({ source: new ol.source.Vector() });

    destPickerMap = new ol.Map({
        target: 'destMapPicker',
        layers: [
            new ol.layer.Tile({ source: new ol.source.OSM() }),
            destPickerMarkerLayer
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat(DEST_MAP_CENTER),
            zoom: DEST_MAP_ZOOM
        })
    });

    destPickerMap.on('click', (evt) => {
        const [lon, lat] = ol.proj.toLonLat(evt.coordinate);
        setDestPickerMarker(lon, lat);
    });

    if (initialCoords && initialCoords.length >= 2) {
        setDestPickerMarker(Number(initialCoords[0]), Number(initialCoords[1]), true);
    } else {
        clearDestPickerMarker();
    }

    setTimeout(() => destPickerMap?.updateSize(), 150);
}

async function uploadDestinationPhoto(file) {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await fetch(`${API_BASE}/upload/attraction-photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        body: formData
    });

    if (!response.ok) {
        throw new Error(await readApiError(response));
    }

    const data = await response.json();
    return data.url;
}

function openDestinationModal(destination = null) {
    const modal = document.getElementById('destinationModal');
    const form = document.getElementById('destinationForm');
    const fileInput = document.getElementById('destImageFile');
    
    if (destination) {
        document.getElementById('modalTitle').textContent = 'Редактировать достопримечательность';
        document.getElementById('destId').value = destination.id;
        document.getElementById('destNameRu').value = destination.name_ru;
        document.getElementById('destDescRu').value = destination.description_ru || '';
        document.getElementById('destFullDescRu').value = destination.full_description || '';
        document.getElementById('destType').value =
            destination.color_palette && DESTINATION_TYPES[destination.color_palette]
                ? destination.color_palette
                : 'baikal';
        if (fileInput) fileInput.value = '';
        setDestinationImagePreview(destination.image_url || '');
    } else {
        document.getElementById('modalTitle').textContent = 'Добавить достопримечательность';
        form.reset();
        document.getElementById('destId').value = '';
        clearDestinationImage();
    }
    
    modal.classList.add('active');

    const initialCoords = destination?.coordinates || null;
    requestAnimationFrame(() => {
        initDestMapPicker(initialCoords);
    });
}

function closeDestinationModal() {
    document.getElementById('destinationModal').classList.remove('active');
    revokeDestImageObjectUrl();
    destroyDestMapPicker();
    destPickerCoords = null;
}

async function editDestination(id) {
    try {
        const response = await fetch(`${API_BASE}/destinations/${id}`);
        const destination = await response.json();
        openDestinationModal(destination);
    } catch (error) {
        console.error('Error fetching destination:', error);
    }
}

document.getElementById('destinationForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('destId').value;
    const submitBtn = e.submitter || document.querySelector('#destinationForm button[type="submit"]');
    const fileInput = document.getElementById('destImageFile');
    let imageUrl = document.getElementById('destImageUrl').value.trim();

    const data = {
        name_ru: document.getElementById('destNameRu').value,
        description_ru: document.getElementById('destDescRu').value,
        full_description: document.getElementById('destFullDescRu').value,
        color_palette: document.getElementById('destType').value,
        image_url: imageUrl || null,
        coordinates: destPickerCoords ? [destPickerCoords.lon, destPickerCoords.lat] : null
    };
    
    try {
        if (submitBtn) submitBtn.disabled = true;

        if (fileInput?.files?.[0]) {
            imageUrl = await uploadDestinationPhoto(fileInput.files[0]);
            data.image_url = imageUrl;
        }

        const url = id 
            ? `${API_BASE}/destinations/${id}`
            : `${API_BASE}/destinations`;
        
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeDestinationModal();
            loadDestinations();
            alert('Сохранено успешно!');
        } else {
            alert(await readApiError(response));
        }
    } catch (error) {
        console.error('Error saving destination:', error);
        alert(error.message || 'Ошибка подключения');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
});

document.getElementById('destImageFile')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    revokeDestImageObjectUrl();
    if (!file) return;

    destImageObjectUrl = URL.createObjectURL(file);
    const img = document.getElementById('destImagePreviewImg');
    const wrap = document.getElementById('destImagePreview');
    img.src = destImageObjectUrl;
    wrap.style.display = 'block';
});

document.getElementById('destImageRemove')?.addEventListener('click', () => {
    clearDestinationImage();
});

document.getElementById('destClearMarker')?.addEventListener('click', () => {
    clearDestPickerMarker();
});

document.getElementById('destinationModalClose')?.addEventListener('click', () => {
    closeDestinationModal();
});

document.getElementById('destinationModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'destinationModal') closeDestinationModal();
});

async function deleteDestination(id) {
    if (!confirm('Вы уверены, что хотите удалить эту достопримечательность?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/destinations/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            loadDestinations();
            alert('Удалено успешно!');
        } else {
            alert(await readApiError(response));
        }
    } catch (error) {
        console.error('Error deleting destination:', error);
        alert('Ошибка подключения');
    }
}

// ==========================================
// BOOKINGS & REVIEWS MODERATION
// ==========================================

async function updateBookingStatus(id, status) {
    try {
        const response = await fetch(`${API_BASE}/bookings/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            loadBookings();
            alert(`Статус изменён на: ${status}`);
        } else {
            alert('Ошибка обновления статуса');
        }
    } catch (error) {
        console.error('Error updating booking status:', error);
    }
}

async function moderateReview(id, status) {
    try {
        const response = await fetch(`${API_BASE}/reviews/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            loadReviews();
            alert(`Отзыв ${status === 'approved' ? 'одобрен' : 'отклонён'}`);
        } else {
            alert('Ошибка модерации');
        }
    } catch (error) {
        console.error('Error moderating review:', error);
    }
}

// Close modal when clicking outside
document.getElementById('destinationModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'destinationModal') {
        closeDestinationModal();
    }
});
