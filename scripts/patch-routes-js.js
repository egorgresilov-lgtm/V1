const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../public/routes.js');
let js = fs.readFileSync(file, 'utf8');
const start = js.indexOf('const toursData = ');
const end = js.indexOf('function renderMap(stages, mapId)');
if (start === -1 || end === -1) {
    console.error('markers not found');
    process.exit(1);
}
const insert = `function routeToTourView(route) {
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

    routesTourGrid.innerHTML = routes.map((route) => \`
        <article class="routes-tour-card scroll-reveal" data-tour="\${route.slug}">
            <div class="routes-tour-image" style="background-image: url('\${route.card_image}');"></div>
            <div class="routes-tour-body">
                <span class="routes-tour-badge">\${route.card_badge || route.duration || ''}</span>
                <h3>\${route.card_title || route.name}</h3>
                <p>\${route.card_summary || route.description || ''}</p>
            </div>
        </article>
    \`).join('');

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
    });
}

async function loadRoutesFromApi() {
    const response = await fetch('/api/routes');
    if (!response.ok) throw new Error('Failed to load routes');
    const routes = await response.json();
    toursData = buildToursData(routes);
    renderRouteCards(routes);
}

`;
js = js.slice(0, start) + insert + js.slice(end);
// Remove old bind block at bottom
js = js.replace(
    /if \(routeCards\.length\) \{[\s\S]*?\}\n\nroutesOverlay/,
    'routesOverlay'
);
fs.writeFileSync(file, js);
console.log('patched routes.js');
