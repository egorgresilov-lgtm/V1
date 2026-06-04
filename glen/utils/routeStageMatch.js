function normalizeRouteStageName(name) {
    return String(name || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function matchDestinationForStage(stage, destinations) {
    if (!stage || !Array.isArray(destinations)) return null;

    if (stage.destination_id) {
        const byId = destinations.find((d) => d.id === Number(stage.destination_id));
        if (byId) return byId;
    }

    const stageNorm = normalizeRouteStageName(stage.name);

    let found = destinations.find((d) => normalizeRouteStageName(d.name_ru) === stageNorm);
    if (!found) {
        found = destinations.find((d) => {
            const dn = normalizeRouteStageName(d.name_ru);
            return dn.includes(stageNorm) || stageNorm.includes(dn);
        });
    }
    if (!found && stageNorm === 'улан-удэ') {
        found = destinations.find((d) => d.name_ru === 'Площадь Советов');
    }
    if (!found && stage.lat != null && stage.lon != null) {
        found = destinations.find((d) => {
            if (!Array.isArray(d.coordinates) || d.coordinates.length < 2) return false;
            return (
                Math.abs(d.coordinates[1] - stage.lat) < 0.05 &&
                Math.abs(d.coordinates[0] - stage.lon) < 0.05
            );
        });
    }

    return found || null;
}

function enrichStageWithDestination(stage, destinations) {
    const dest = matchDestinationForStage(stage, destinations);
    if (!dest) return { ...stage };

    return {
        ...stage,
        destination_id: dest.id,
        name: stage.name || dest.name_ru,
        lat: stage.lat != null ? stage.lat : dest.coordinates[1],
        lon: stage.lon != null ? stage.lon : dest.coordinates[0],
        desc: stage.desc || dest.description_ru || '',
        img: stage.img || dest.image_url || ''
    };
}

module.exports = { matchDestinationForStage, enrichStageWithDestination, normalizeRouteStageName };
