// ==========================================
// ROUTES PAGE - TOUR OVERLAY EXPERIENCE
// ==========================================

const routesOverlay = document.getElementById('routesTourOverlay');
const routesDetail = document.getElementById('routesTourDetail');
const routesTourGrid = document.getElementById('routesTourGrid');
let currentMap = null;
let currentStages = [];
let currentThemeClass = null;
let toursData = {};

// Nav/scroll on routes.html only (index uses script.js)
const isRoutesOnlyPage = !document.getElementById('destinationsGrid');

if (isRoutesOnlyPage) {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.scroll-reveal').forEach((el) => {
        observer.observe(el);
    });

    hamburger?.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-menu a').forEach((link) => {
        link.addEventListener('click', () => {
            hamburger?.classList.remove('active');
            navMenu?.classList.remove('active');
        });
    });

    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        navbar.style.boxShadow = window.scrollY > 50
            ? '0 2px 20px rgba(0, 0, 0, 0.15)'
            : '0 2px 10px rgba(0, 0, 0, 0.1)';
    });

}

function routeToTourView(route) {
    return {
        name: route.name,
        themeClass: route.theme_class,
        duration: route.duration,
        description: route.description,
        stages: route.stages || []
    };
}

function buildToursData(routes) {
    const map = {};
    routes.forEach((route) => {
        map[route.slug] = routeToTourView(route);
    });
    return map;
}

function renderRouteCards(routes) {
    if (!routesTourGrid) return;

    routesTourGrid.innerHTML = routes.map((route) => `
        <article class="routes-tour-card scroll-reveal" data-tour="${route.slug}">
            <div class="routes-tour-image" style="background-image: url('${route.card_image}');"></div>
            <div class="routes-tour-body">
                <span class="routes-tour-badge">${route.card_badge || route.duration || ''}</span>
                <h3>${route.card_title || route.name}</h3>
                <p>${route.card_summary || route.description || ''}</p>
            </div>
        </article>
    `).join('');

    bindRouteCards();
}

function bindRouteCards() {
    const cards = document.querySelectorAll('.routes-tour-card');
    cards.forEach((card, index) => {
        if (isRoutesOnlyPage) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(25px)';
            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 120);
        }

        card.addEventListener('click', () => {
            const tourId = card.dataset.tour;
            if (tourId) openTour(tourId);
        });

        if (!isRoutesOnlyPage) {
            card.classList.add('visible');
        }
    });
}

async function fetchRoutesList() {
    try {
        const response = await fetch('/api/routes');
        const text = await response.text();
        const data = JSON.parse(text);
        if (Array.isArray(data) && data.length > 0) {
            return data;
        }
    } catch (e) {
        console.warn('API routes unavailable, using static data:', e.message);
    }

    const fallback = await fetch('/data/routes.json');
    if (!fallback.ok) throw new Error('Failed to load routes');
    const routes = await fallback.json();
    if (!Array.isArray(routes) || !routes.length) {
        throw new Error('Routes list is empty');
    }
    return routes;
}

async function loadRoutesFromApi() {
    const routes = await fetchRoutesList();
    toursData = buildToursData(routes);
    renderRouteCards(routes);
}

function renderMap(stages, mapId) {
    if (!window.ol || !stages.length) {
        return;
    }

    if (currentMap) {
        currentMap.setTarget(null);
        currentMap = null;
    }

    const transformedPoints = stages.map((stage) => ol.proj.fromLonLat([stage.lon, stage.lat]));

    const routeFeature = new ol.Feature({
        geometry: new ol.geom.LineString(transformedPoints)
    });
    routeFeature.setStyle(new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#2C5F7C',
            width: 4
        })
    }));

    const markerFeatures = stages.map((stage) => {
        const feature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([stage.lon, stage.lat]))
        });
        feature.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({ color: '#2C5F7C' }),
                stroke: new ol.style.Stroke({ color: '#FFFFFF', width: 2 })
            })
        }));
        return feature;
    });

    const vectorSource = new ol.source.Vector({
        features: [routeFeature, ...markerFeatures]
    });

    currentMap = new ol.Map({
        target: mapId,
        layers: [
            new ol.layer.Tile({ source: new ol.source.OSM() }),
            new ol.layer.Vector({ source: vectorSource })
        ],
        view: new ol.View({
            center: transformedPoints[0],
            zoom: 7
        })
    });

    currentMap.getView().fit(routeFeature.getGeometry().getExtent(), {
        padding: [30, 30, 30, 30],
        duration: 350
    });
}

function openTour(tourId) {
    const tour = toursData[tourId];
    if (!tour || !routesOverlay || !routesDetail) {
        return;
    }

    if (currentThemeClass) {
        document.body.classList.remove(currentThemeClass);
    }
    currentThemeClass = tour.themeClass;
    if (currentThemeClass) {
        document.body.classList.add(currentThemeClass);
    }
    document.body.classList.add('routes-tour-open');

    const stagesHtml = tour.stages.map((stage) => `
        <article class="routes-stage-card">
            <div class="routes-stage-image" style="background-image: url('${stage.img}')"></div>
            <h3>${stage.name}</h3>
            <p class="routes-stage-coords">📍 ${stage.lat.toFixed(4)}, ${stage.lon.toFixed(4)}</p>
            <p>${stage.desc}</p>
        </article>
    `).join('');

    routesDetail.innerHTML = `
        <button class="routes-tour-close" id="routesTourClose" aria-label="Закрыть окно">×</button>
        <div class="routes-tour-header">
            <h2>${tour.name}</h2>
            <span class="routes-tour-duration">${tour.duration}</span>
            <p>${tour.description}</p>
        </div>
        <h3 class="routes-stages-title">Этапы маршрута</h3>
        <div class="routes-stages-scroll">${stagesHtml}</div>
        <div class="routes-tour-summary">
            Маршрут на карте отражает последовательность точек по дням. Для точной логистики
            рекомендуется подтверждать дорожные условия перед выездом.
        </div>
        <div id="routesTourMap" class="routes-map"></div>
        <div class="routes-tour-actions">
            <button type="button" class="routes-tour-center-btn" id="routesTourCenterMap">Центрировать карту</button>
        </div>
    `;

    routesOverlay.classList.add('active');
    routesOverlay.setAttribute('aria-hidden', 'false');
    currentStages = tour.stages;

    setTimeout(() => renderMap(tour.stages, 'routesTourMap'), 120);

    const closeButton = document.getElementById('routesTourClose');
    const centerButton = document.getElementById('routesTourCenterMap');

    closeButton?.addEventListener('click', closeTour);
    centerButton?.addEventListener('click', () => {
        if (!currentMap || !currentStages.length) {
            return;
        }
        const coords = currentStages.map((stage) => ol.proj.fromLonLat([stage.lon, stage.lat]));
        const extent = new ol.geom.LineString(coords).getExtent();
        currentMap.getView().fit(extent, {
            padding: [30, 30, 30, 30],
            duration: 250
        });
    });
}

function closeTour() {
    routesOverlay?.classList.remove('active');
    routesOverlay?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('routes-tour-open');
    if (currentThemeClass) {
        document.body.classList.remove(currentThemeClass);
        currentThemeClass = null;
    }
    if (currentMap) {
        currentMap.setTarget(null);
        currentMap = null;
    }
}

routesOverlay?.addEventListener('click', (event) => {
    if (event.target === routesOverlay) {
        closeTour();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && routesOverlay?.classList.contains('active')) {
        closeTour();
    }
});

if (routesTourGrid) {
    loadRoutesFromApi().catch((err) => {
        console.error('Routes load error:', err);
        routesTourGrid.innerHTML = '<p class="intro-text" style="grid-column:1/-1;text-align:center;">Не удалось загрузить маршруты. Перезапустите сервер (<code>npm start</code>) и обновите страницу.</p>';
    });
}
