// Builds a turn-by-turn indoor route between two room features, tracing polygon boundaries to follow corridors.
const WALK_PACE_MPM = 80;

const FLOOR_LABEL = {
    G: 'Ground Floor', '1': 'First Floor', '2': 'Second Floor', '3': 'Third Floor',
};

function haversineMetres([lng1, lat1], [lng2, lat2]) {
    const R = 6_371_000;
    const toRad = d => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function closestPointOnSegment([x1, y1], [x2, y2], [px, py]) {
    const dx = x2 - x1, dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return [x1, y1];
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
    return [x1 + t * dx, y1 + t * dy];
}

function closestPointOnPolygon(geometry, point) {
    const ring = geometry?.coordinates?.[0];
    if (!ring || ring.length < 2) return null;
    let best = null, bestDist = Infinity;
    for (let i = 0; i < ring.length - 1; i++) {
        const pt = closestPointOnSegment(ring[i], ring[i + 1], point);
        const d  = haversineMetres(pt, point);
        if (d < bestDist) { bestDist = d; best = pt; }
    }
    return best;
}

function getCentroid(feature) {
    return [feature.properties.centerLng, feature.properties.centerLat];
}

function findNearestStair(fromCentroid, stairFeatures) {
    if (!stairFeatures?.length) return null;
    let nearest = null, minDist = Infinity;
    for (const f of stairFeatures) {
        const c = getCentroid(f);
        if (c[0] == null || c[1] == null) continue;
        const d = haversineMetres(fromCentroid, c);
        if (d < minDist) { minDist = d; nearest = f; }
    }
    return nearest;
}

function roomLabel(props)  { return props.name || props.roomCode || 'destination'; }
function floorLabel(name)  { return FLOOR_LABEL[name] ?? `Floor ${name}`; }
function floorZ(props) {
    if (props.z != null) return props.z;
    if (props.floorName === 'G') return 1;
    const n = parseInt(props.floorName, 10);
    return isNaN(n) ? 1 : n + 1;
}

export function buildIndoorRoute(startFeature, endFeature, stairsGeoJSON) {
    const sp       = startFeature.properties;
    const ep       = endFeature.properties;
    const startC   = getCentroid(startFeature);
    const endC     = getCentroid(endFeature);
    const allStairs = stairsGeoJSON?.features ?? [];

    if (sp.buildingId !== ep.buildingId) return null;

    const sameFloor = sp.floorId === ep.floorId;
    const steps = [];
    const path  = [];

    if (sameFloor) {
        const startWall = closestPointOnPolygon(startFeature.geometry, endC)   ?? startC;
        const endWall   = closestPointOnPolygon(endFeature.geometry,   startC) ?? endC;
        path.push(startC, startWall, endWall, endC);
        const dist = haversineMetres(startC, endC);
        steps.push({ type: 'walk',    description: `Walk to ${roomLabel(ep)}`,             metres: dist, location: endC, stairRoomCode: null });
        steps.push({ type: 'arrived', description: `You have arrived at ${roomLabel(ep)}`, metres: 0,    location: endC, stairRoomCode: null });
    } else {
        const bldStairs = allStairs.filter(f => f.properties.buildingId === sp.buildingId);
        const stair     = findNearestStair(startC, bldStairs);

        if (!stair) {
            const startWall = closestPointOnPolygon(startFeature.geometry, endC)   ?? startC;
            const endWall   = closestPointOnPolygon(endFeature.geometry,   startC) ?? endC;
            path.push(startC, startWall, endWall, endC);
            steps.push({ type: 'walk', description: `Walk to ${roomLabel(ep)}`, metres: haversineMetres(startC, endC), location: endC, stairRoomCode: null });
        } else {
            const stairC    = getCentroid(stair);
            const startWall = closestPointOnPolygon(startFeature.geometry, stairC) ?? startC;
            const endWall   = closestPointOnPolygon(endFeature.geometry,   stairC) ?? endC;
            const goingUp   = floorZ(ep) > floorZ(sp);
            const stairType = goingUp ? 'stairs_up' : 'stairs_down';
            const verb      = goingUp ? 'up' : 'down';
            const stairCode = stair.properties.roomCode ?? null;
            path.push(startC, startWall, stairC, endWall, endC);
            steps.push({ type: 'walk',    description: 'Walk to stairs',                                        metres: haversineMetres(startC, stairC), location: stairC, stairRoomCode: stairCode });
            steps.push({ type: stairType, description: `Go ${verb} the stairs to ${floorLabel(ep.floorName)}`, metres: 0,                                location: stairC, stairRoomCode: stairCode });
            steps.push({ type: 'walk',    description: `Walk to ${roomLabel(ep)}`,                              metres: haversineMetres(stairC, endC),   location: endC,   stairRoomCode: null });
        }

        steps.push({ type: 'arrived', description: `You have arrived at ${roomLabel(ep)}`, metres: 0, location: endC, stairRoomCode: null });
    }

    const totalMetres  = steps.reduce((sum, s) => sum + (s.metres ?? 0), 0);
    const totalMinutes = Math.ceil(totalMetres / WALK_PACE_MPM);
    const requiresStairs = steps.some(s => s.type === 'stairs_up' || s.type === 'stairs_down');

    return { steps, path, totalMetres, totalMinutes, requiresStairs };
}
