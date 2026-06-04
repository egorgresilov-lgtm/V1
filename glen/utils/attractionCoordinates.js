const fs = require('fs');
const path = require('path');

let normalizedCache = null;

function normalizePlaceName(name) {
    return String(name || '')
        .toLowerCase()
        .replace(/[-–—]/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/[«»"]/g, '')
        .replace(/\([^)]*\)/g, '')
        .trim();
}

function loadNormalizedCoordinates() {
    if (normalizedCache) return normalizedCache;

    const filePath = path.join(__dirname, '..', 'public', 'data', 'coordinates.json');
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    normalizedCache = (Array.isArray(raw) ? raw : []).map((item) => ({
        key: normalizePlaceName(item.name),
        lat: item.lat,
        lng: item.lng
    }));
    return normalizedCache;
}

function getCoordinatesByName(name) {
    const normalizedName = normalizePlaceName(name);
    if (!normalizedName) return null;

    const list = loadNormalizedCoordinates();
    const match = list.find(
        (item) =>
            item.key === normalizedName ||
            item.key.includes(normalizedName) ||
            normalizedName.includes(item.key)
    );

    if (!match) return null;
    return { lat: match.lat, lng: match.lng };
}

/** Same lookup as the attractions page — prefer over stored tour point coords. */
function resolveTourPointCoordinates(point) {
    const names = [point?.destination_name, point?.custom_place_name].filter(Boolean);
    for (const name of names) {
        const coords = getCoordinatesByName(name);
        if (coords) return coords;
    }
    if (point?.latitude != null && point?.longitude != null) {
        return { lat: Number(point.latitude), lng: Number(point.longitude) };
    }
    return null;
}

module.exports = {
    normalizePlaceName,
    getCoordinatesByName,
    resolveTourPointCoordinates
};
