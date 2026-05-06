// Shared routing utilities — distance math, step derivation, Dijkstra, and Mapbox route fetching.

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
    let accumulated  = 0;
    let groupBearing = getBearing(coords[0], coords[1]);

    for (let i = 1; i < coords.length; i++) {
        const dist    = haversineM(coords[i - 1], coords[i]);
        const bearing = i < coords.length - 1 ? getBearing(coords[i - 1], coords[i]) : groupBearing;
        const diff    = Math.abs(bearing - groupBearing);
        const turn    = diff > 180 ? 360 - diff : diff;

        if (turn > 28 && accumulated > 8) {
            steps.push({ metres: Math.round(accumulated), dir: bearingToLabel(groupBearing) });
            accumulated  = dist;
            groupBearing = bearing;
        } else {
            accumulated += dist;
        }
    }
    if (accumulated > 1) steps.push({ metres: Math.round(accumulated), dir: bearingToLabel(groupBearing) });
    return steps;
}

export function fmtDist(m) {
    if (m == null || m <= 0) return null;
    return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

export function walkingStats(coords) {
    let dist = 0;
    for (let i = 1; i < coords.length; i++) dist += haversineM(coords[i - 1], coords[i]);
    return { metres: Math.round(dist), minutes: Math.ceil(dist / 80) };
}

export function snapToNearestBuilding(userCoords, buildings) {
    if (!userCoords || !buildings?.length) return null;
    let nearest = null, best = Infinity;
    for (const b of buildings) {
        const coords = b.coordinates || [b.lng, b.lat];
        if (!coords || coords.length < 2) continue;
        const d = haversineM(userCoords, coords);
        if (d < best) { best = d; nearest = b; }
    }
    return nearest;
}

export function buildAdjacency(edges, nodes) {
    const graph   = {};
    const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
    for (const edge of edges) {
        if (!graph[edge.from]) graph[edge.from] = [];
        if (!graph[edge.to])   graph[edge.to]   = [];
        const nodeA  = nodeMap[edge.from];
        const nodeB  = nodeMap[edge.to];
        const weight = nodeA && nodeB ? haversineM([nodeA.lng, nodeA.lat], [nodeB.lng, nodeB.lat]) : 1;
        graph[edge.from].push({ target: edge.to,   weight });
        graph[edge.to].push(  { target: edge.from, weight });
    }
    return graph;
}

export function findPathDijkstra(startId, endId, edges, nodes) {
    const graph     = buildAdjacency(edges, nodes);
    const distances = {};
    const previous  = {};
    const unvisited = new Set();

    for (const edge of edges) {
        distances[edge.from] = Infinity;
        distances[edge.to]   = Infinity;
        unvisited.add(edge.from);
        unvisited.add(edge.to);
    }
    distances[startId] = 0;

    while (unvisited.size > 0) {
        let current = null, minDistance = Infinity;
        for (const nodeId of unvisited) {
            if (distances[nodeId] < minDistance) { minDistance = distances[nodeId]; current = nodeId; }
        }
        if (current === null || current === endId) break;
        unvisited.delete(current);
        for (const neighbor of graph[current] || []) {
            if (!unvisited.has(neighbor.target)) continue;
            const alt = distances[current] + neighbor.weight;
            if (alt < distances[neighbor.target]) {
                distances[neighbor.target] = alt;
                previous[neighbor.target]  = current;
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

export function routeBetweenNodeIds(startNodeId, endNodeId, campusNodes, campusEdges) {
    const pathIds = findPathDijkstra(startNodeId, endNodeId, campusEdges, campusNodes);
    if (!pathIds) {
        console.error('No graph path found between node ids', { startNodeId, endNodeId });
        return { error: 'No graph path found between node ids.' };
    }
    const nodeMap = Object.fromEntries(campusNodes.map(n => [n.id, n]));
    const coords  = pathIds.map(id => {
        const node = nodeMap[id];
        if (!node) throw new Error(`Node "${id}" was referenced but not found in campusNodes.`);
        return [node.lng, node.lat];
    });
    return { coords, pathIds };
}

export async function fetchMapboxRoute(startCoords, endCoords) {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) return { error: 'Missing Mapbox access token.' };

    const url = `https://api.mapbox.com/directions/v5/mapbox/walking/` +
        `${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}` +
        `?geometries=geojson&overview=full&access_token=${token}`;

    try {
        const res  = await fetch(url);
        const data = await res.json();
        if (!data?.routes?.length) {
            console.error('No Mapbox route found:', data);
            return { error: 'No Mapbox route found.' };
        }
        return { coords: data.routes[0].geometry.coordinates };
    } catch (err) {
        console.error('Mapbox route fetch failed:', err);
        return { error: 'Failed to fetch Mapbox route.' };
    }
}

export async function buildHybridRouteFromCoordsToCampus(startCoords, endLocation, campusNodes, campusEdges, locationNodeMap, campusEntryNodeIds) {
    const endNodeId = locationNodeMap[toLocationMapKey(endLocation.id)];
    if (!endNodeId) {
        console.error('Missing campus node mapping for hybrid destination', { endLocationId: endLocation.id });
        return { error: 'Missing campus node mapping for destination.' };
    }

    let bestOption = null;
    for (const entryNodeId of campusEntryNodeIds) {
        const entryNode = campusNodes.find(n => n.id === entryNodeId);
        if (!entryNode) continue;
        const entryCoords  = [entryNode.lng, entryNode.lat];
        const mapboxPart   = await fetchMapboxRoute(startCoords, entryCoords);
        if (mapboxPart.error) continue;
        const campusPart   = routeBetweenNodeIds(entryNodeId, endNodeId, campusNodes, campusEdges);
        if (campusPart.error) continue;
        const mergedCoords = [...mapboxPart.coords, ...campusPart.coords.slice(1)];
        const totalMetres  = walkingStats(mergedCoords).metres;
        if (!bestOption || totalMetres < bestOption.totalMetres) {
            bestOption = { coords: mergedCoords, totalMetres, entryNodeId, campusPathIds: campusPart.pathIds };
        }
    }

    if (!bestOption) return { error: 'No hybrid route could be built.' };
    return { coords: bestOption.coords, entryNodeId: bestOption.entryNodeId, campusPathIds: bestOption.campusPathIds };
}

export async function buildHybridRouteFromCampusToCoords(startLocation, endCoords, campusNodes, campusEdges, locationNodeMap, campusEntryNodeIds) {
    const startNodeId = locationNodeMap[toLocationMapKey(startLocation.id)];
    if (!startNodeId) {
        console.error('Missing campus node mapping for hybrid start', { startLocationId: startLocation.id });
        return { error: 'Missing campus node mapping for start location.' };
    }

    let bestOption = null;
    for (const entryNodeId of campusEntryNodeIds) {
        const entryNode = campusNodes.find(n => n.id === entryNodeId);
        if (!entryNode) continue;
        const entryCoords  = [entryNode.lng, entryNode.lat];
        const campusPart   = routeBetweenNodeIds(startNodeId, entryNodeId, campusNodes, campusEdges);
        if (campusPart.error) continue;
        const mapboxPart   = await fetchMapboxRoute(entryCoords, endCoords);
        if (mapboxPart.error) continue;
        const mergedCoords = [...campusPart.coords, ...mapboxPart.coords.slice(1)];
        const totalMetres  = walkingStats(mergedCoords).metres;
        if (!bestOption || totalMetres < bestOption.totalMetres) {
            bestOption = { coords: mergedCoords, totalMetres, entryNodeId, campusPathIds: campusPart.pathIds };
        }
    }

    if (!bestOption) return { error: 'No hybrid route could be built.' };
    return { coords: bestOption.coords, entryNodeId: bestOption.entryNodeId, campusPathIds: bestOption.campusPathIds };
}
