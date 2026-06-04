/**
 * Coordinates from /data/coordinates.json — same source as the attractions page map.
 */
(function (global) {
    let koordCache = [];

    function normalizePlaceName(name) {
        return String(name || '')
            .toLowerCase()
            .replace(/[-–—]/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/[«»"]/g, '')
            .replace(/\([^)]*\)/g, '')
            .trim();
    }

    async function ensureLoaded() {
        if (koordCache.length > 0) return koordCache;
        try {
            const res = await fetch('/data/coordinates.json');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const points = await res.json();
            koordCache = (Array.isArray(points) ? points : []).map((item) => ({
                key: normalizePlaceName(item.name),
                lat: item.lat,
                lng: item.lng
            }));
        } catch (e) {
            console.warn('[KOORD] Failed to load coordinates.json:', e);
            koordCache = [];
        }
        return koordCache;
    }

    function getByName(name) {
        const normalizedName = normalizePlaceName(name);
        if (!normalizedName || koordCache.length === 0) return null;

        const match = koordCache.find(
            (item) =>
                item.key === normalizedName ||
                item.key.includes(normalizedName) ||
                normalizedName.includes(item.key)
        );
        if (!match) return null;
        return { lat: match.lat, lng: match.lng };
    }

    function resolveTourPoint(point) {
        const names = [point?.destination_name, point?.custom_place_name].filter(Boolean);
        for (const name of names) {
            const coords = getByName(name);
            if (coords) return coords;
        }
        if (point?.latitude != null && point?.longitude != null) {
            return { lat: Number(point.latitude), lng: Number(point.longitude) };
        }
        return null;
    }

    function applyToDestination(dest) {
        if (Array.isArray(dest?.coordinates) && dest.coordinates.length >= 2) {
            return dest;
        }
        const coords = getByName(dest?.name_ru);
        if (!coords) return dest;
        return { ...dest, coordinates: [coords.lng, coords.lat] };
    }

    global.AttractionCoordinates = {
        ensureLoaded,
        getByName,
        resolveTourPoint,
        applyToDestination
    };
})(window);
