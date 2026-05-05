// Pure utility functions shared between useNavigation and NavInstructions.

export function haversineM([lng1, lat1], [lng2, lat2]) {
    const R = 6371000;
    const r = d => d * Math.PI / 180;
    const dLat = r(lat2 - lat1);
    const dLng = r(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getBearing(a, b) {
    const r = d => d * Math.PI / 180;
    const dLng = r(b[0] - a[0]);
    const y = Math.sin(dLng) * Math.cos(r(b[1]));
    const x = Math.cos(r(a[1])) * Math.sin(r(b[1])) - Math.sin(r(a[1])) * Math.cos(r(b[1])) * Math.cos(dLng);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

export function bearingToLabel(deg) {
    const dirs = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
    return dirs[Math.round(deg / 45) % 8];
}

export function deriveSteps(coords) {
    if (!coords || coords.length < 2) return [];
    const steps = [];
    let accumulated = 0;
    let groupBearing = getBearing(coords[0], coords[1]);

    for (let i = 1; i < coords.length; i++) {
        const dist = haversineM(coords[i - 1], coords[i]);
        const bearing = i < coords.length - 1
            ? getBearing(coords[i - 1], coords[i])
            : groupBearing;

        const diff = Math.abs(bearing - groupBearing);
        const turn = diff > 180 ? 360 - diff : diff;

        if (turn > 28 && accumulated > 8) {
            steps.push({ metres: Math.round(accumulated), dir: bearingToLabel(groupBearing) });
            accumulated = dist;
            groupBearing = bearing;
        } else {
            accumulated += dist;
        }
    }
    if (accumulated > 1) {
        steps.push({ metres: Math.round(accumulated), dir: bearingToLabel(groupBearing) });
    }
    return steps;
}

export function fmtDist(m) {
    if (m == null || m <= 0) return null;
    return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

export function walkingStats(coords) {
    let dist = 0;
    for (let i = 1; i < coords.length; i++) {
        dist += haversineM(coords[i - 1], coords[i]);
    }
    return { metres: Math.round(dist), minutes: Math.ceil(dist / 80) };
}

export function snapToNearestBuilding(userCoords, buildings) {
    if (!userCoords || !buildings?.length) return null;
    let nearest = null;
    let best = Infinity;
    for (const b of buildings) {
        const coords = b.coordinates || [b.lng, b.lat];
        if (!coords || coords.length < 2) continue;
        const d = haversineM(userCoords, coords);
        if (d < best) { best = d; nearest = b; }
    }
    return nearest;
}

export function buildAdjacency(edges, nodes) {
    const graph = {};
    const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
    for (const edge of edges) {
        if (!graph[edge.from]) graph[edge.from] = [];
        if (!graph[edge.to])   graph[edge.to]   = [];
        const nodeA = nodeMap[edge.from];
        const nodeB = nodeMap[edge.to];
        let weight = 1;
        if (nodeA && nodeB) {
            weight = haversineM([nodeA.lng, nodeA.lat], [nodeB.lng, nodeB.lat]);
        }
        graph[edge.from].push({ target: edge.to, weight });
        graph[edge.to].push({ target: edge.from, weight });
    }
    return graph;
}

export function findPathDijkstra(startId, endId, edges, nodes) {
    const graph = buildAdjacency(edges, nodes);
    const distances = {};
    const previous = {};
    const unvisited = new Set();

    for (const edge of edges) {
        distances[edge.from] = Infinity;
        distances[edge.to]   = Infinity;
        unvisited.add(edge.from);
        unvisited.add(edge.to);
    }
    distances[startId] = 0;

    while (unvisited.size > 0) {
        let current = null;
        let minDistance = Infinity;
        for (const nodeId of unvisited) {
            if (distances[nodeId] < minDistance) {
                minDistance = distances[nodeId];
                current = nodeId;
            }
        }
        if (current === null || current === endId) break;
        unvisited.delete(current);
        for (const neighbor of graph[current] || []) {
            if (!unvisited.has(neighbor.target)) continue;
            const alt = distances[current] + neighbor.weight;
            if (alt < distances[neighbor.target]) {
                distances[neighbor.target] = alt;
                previous[neighbor.target] = current;
            }
        }
    }

    if (distances[endId] === Infinity) return null;
    const path = [];
    let curr = endId;
    while (curr) { path.unshift(curr); curr = previous[curr]; }
    return path;
}

export function toLocationMapKey(id) {
    if (!id) return '';
    return String(id).trim().toLowerCase();
}
