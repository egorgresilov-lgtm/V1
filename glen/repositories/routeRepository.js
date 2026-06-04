const fs = require('fs');
const path = require('path');
const ROUTES_SEED = require('../data/routesSeed');
const { enrichStageWithDestination } = require('../utils/routeStageMatch');

const STORE_FILE = path.join(__dirname, '..', 'database', 'routes_store.json');
const DESTINATIONS_STORE_FILE = path.join(__dirname, '..', 'database', 'destinations_store.json');

function seedStore() {
    return {
        routes: ROUTES_SEED.map((r, i) => ({ ...r, id: i + 1 })),
        nextId: ROUTES_SEED.length + 1
    };
}

function loadDestinationsSync() {
    if (!fs.existsSync(DESTINATIONS_STORE_FILE)) return [];
    try {
        const parsed = JSON.parse(fs.readFileSync(DESTINATIONS_STORE_FILE, 'utf8'));
        return (parsed.destinations || []).filter(
            (d) => Array.isArray(d.coordinates) && d.coordinates.length >= 2
        );
    } catch {
        return [];
    }
}

function enrichRoutesStages(data) {
    const seedBySlug = Object.fromEntries(ROUTES_SEED.map((r) => [r.slug, r.stages]));
    const destinations = loadDestinationsSync();
    let changed = false;

    data.routes.forEach((route) => {
        if ((!route.stages || !route.stages.length) && seedBySlug[route.slug]?.length) {
            route.stages = seedBySlug[route.slug].map((s) => ({ ...s }));
            changed = true;
        }
        if (!Array.isArray(route.stages)) {
            route.stages = [];
            changed = true;
            return;
        }
        if (!destinations.length) return;

        route.stages = route.stages.map((stage) => {
            const next = enrichStageWithDestination(stage, destinations);
            if (next.destination_id && !stage.destination_id) changed = true;
            return next;
        });
    });

    if (changed) saveStore(data);
    return data;
}

function loadStore() {
    if (fs.existsSync(STORE_FILE)) {
        try {
            const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
            if (Array.isArray(parsed.routes) && parsed.routes.length) {
                const maxId = parsed.routes.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0);
                parsed.nextId = parsed.nextId || maxId + 1;
                return enrichRoutesStages(parsed);
            }
        } catch (e) {
            console.warn('[routes] Cannot read store, re-seeding:', e.message);
        }
    }
    const fresh = seedStore();
    saveStore(fresh);
    return enrichRoutesStages(fresh);
}

const PUBLIC_ROUTES_JSON = path.join(__dirname, '..', 'public', 'data', 'routes.json');

function saveStore(data) {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf8');
    try {
        const publicDir = path.dirname(PUBLIC_ROUTES_JSON);
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
        const sorted = [...data.routes].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        fs.writeFileSync(PUBLIC_ROUTES_JSON, JSON.stringify(sorted, null, 2), 'utf8');
    } catch (e) {
        console.warn('[routes] Could not update public/data/routes.json:', e.message);
    }
}

let store = loadStore();

class RouteRepository {
    async findAll() {
        return [...store.routes].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    }

    async findById(id) {
        return store.routes.find((r) => r.id === Number(id)) || null;
    }

    async findBySlug(slug) {
        return store.routes.find((r) => r.slug === slug) || null;
    }

    async create(data) {
        const slug = String(data.slug || '').trim();
        if (!slug) throw new Error('slug required');
        if (store.routes.some((r) => r.slug === slug)) throw new Error('slug already exists');

        const item = {
            id: store.nextId++,
            slug,
            name: data.name || '',
            theme_class: data.theme_class || 'routes-theme-rural',
            duration: data.duration || '',
            description: data.description || '',
            card_title: data.card_title || data.name || '',
            card_badge: data.card_badge || data.duration || '',
            card_summary: data.card_summary || data.description || '',
            card_image: data.card_image || '',
            stages: Array.isArray(data.stages) ? data.stages : [],
            sort_order: data.sort_order != null ? Number(data.sort_order) : store.routes.length + 1
        };
        store.routes.push(item);
        saveStore(store);
        return item;
    }

    async update(id, data) {
        const idx = store.routes.findIndex((r) => r.id === Number(id));
        if (idx === -1) return null;

        const current = store.routes[idx];
        if (data.slug && data.slug !== current.slug) {
            if (store.routes.some((r) => r.slug === data.slug && r.id !== current.id)) {
                throw new Error('slug already exists');
            }
        }

        const updated = {
            ...current,
            ...data,
            id: current.id
        };
        if (data.stages != null) {
            updated.stages = data.stages;
        }
        store.routes[idx] = updated;
        saveStore(store);
        return updated;
    }

    async delete(id) {
        const idx = store.routes.findIndex((r) => r.id === Number(id));
        if (idx === -1) return null;
        const [removed] = store.routes.splice(idx, 1);
        saveStore(store);
        return removed;
    }
}

module.exports = new RouteRepository();
