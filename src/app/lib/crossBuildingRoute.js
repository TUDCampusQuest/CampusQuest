// Builds a combined outdoor + indoor route when the start and destination are in different buildings.
import { locations } from '../data/locations';
import { buildIndoorRoute } from './indoorRouter';
import { haversineM } from './routeUtils';
import { GRAPH_NODE_PATCHES, GRAPH_EDGE_PATCHES, LOCATION_NODE_OVERRIDES } from '../data/graphPatches';

function findPathBFS(startId, endId, edges) {
    const adj = {};
    for (const e of edges) {
        if (!adj[e.from]) adj[e.from] = [];
        if (!adj[e.to])   adj[e.to]   = [];
        adj[e.from].push(e.to);
        adj[e.to].push(e.from);
    }
    const queue   = [[startId]];
    const visited = new Set([startId]);
    while (queue.length) {
        const path = queue.shift();
        const cur  = path[path.length - 1];
        if (cur === endId) return path;
        for (const nb of adj[cur] ?? []) {
            if (!visited.has(nb)) {
                visited.add(nb);
                queue.push([...path, nb]);
            }
        }
    }
    return null;
}

function findStartRoomForBuilding(buildingId, roomsFeatures) {
    const candidates = roomsFeatures.filter(f => {
        const p = f.properties;
        return (
            String(p.buildingId) === String(buildingId) &&
            (p.floorName === 'G' || p.z === 1) &&
            (
                p.kind === 'circulation_room' ||
                p.typeName?.toLowerCase().includes('entrance') ||
                p.typeName?.toLowerCase().includes('circulation') ||
                p.typeName?.toLowerCase().includes('reception') ||
                p.typeName?.toLowerCase().includes('lobby')
            )
        );
    });
    if (candidates.length > 0) return candidates[0];
    return roomsFeatures.find(f =>
        String(f.properties.buildingId) === String(buildingId) &&
        (f.properties.floorName === 'G' || f.properties.z === 1)
    ) ?? null;
}

export async function buildCrossBuildingRoute(startFeature, destFeature, stairs, rooms, campusGraph) {
    const sp = startFeature.properties;
    const ep = destFeature.properties;

    const nodes   = [...(campusGraph?.campusNodes ?? campusGraph?.nodes ?? []), ...GRAPH_NODE_PATCHES];
    const edges   = [...(campusGraph?.campusEdges ?? campusGraph?.edges ?? []), ...GRAPH_EDGE_PATCHES];
    const nodeMap = { ...(campusGraph?.locationNodeMap ?? {}), ...LOCATION_NODE_OVERRIDES };

    const locationsArray = Array.isArray(locations) ? locations : [];
    const startLoc = locationsArray.find(l => String(l.buildingId) === String(sp.buildingId));
    const endLoc   = locationsArray.find(l => String(l.buildingId) === String(ep.buildingId));

    if (!startLoc || !endLoc) return null;

    const startNodeId = nodeMap[startLoc.id?.toLowerCase()];
    const endNodeId   = nodeMap[endLoc.id?.toLowerCase()];

    if (!startNodeId || !endNodeId) return null;

    const pathIds = findPathBFS(startNodeId, endNodeId, edges);
    if (!pathIds) return null;

    const nodeById      = Object.fromEntries(nodes.map(n => [n.id, n]));
    const outdoorCoords = pathIds.map(id => nodeById[id]).filter(Boolean).map(n => [n.lng, n.lat]);

    if (outdoorCoords.length < 2) return null;

    const destEntryRoom = findStartRoomForBuilding(ep.buildingId, rooms.features);
    const indoorLeg     = destEntryRoom ? buildIndoorRoute(destEntryRoom, destFeature, stairs) : null;
    const indoorPath    = indoorLeg?.path ?? [[ep.centerLng, ep.centerLat]];
    const fullPath      = [...outdoorCoords, ...indoorPath];

    const outdoorDist    = outdoorCoords.reduce((sum, c, i) => i === 0 ? sum : sum + haversineM(outdoorCoords[i - 1], c), 0);
    const exitLocation   = outdoorCoords[0];
    const entryLocation  = outdoorCoords[outdoorCoords.length - 1];

    const steps = [
        { type: 'exit_building',  description: `Exit ${startLoc.name}`,      metres: 0,                       location: exitLocation,  stairRoomCode: null },
        { type: 'walk',           description: `Walk to ${endLoc.name}`,      metres: Math.round(outdoorDist), location: entryLocation, stairRoomCode: null },
        { type: 'enter_building', description: `Enter ${endLoc.name}`,        metres: 0,                       location: entryLocation, stairRoomCode: null },
        ...(indoorLeg?.steps ?? [
            { type: 'walk',    description: `Walk to ${ep.name || ep.roomCode}`,             metres: 20, location: [ep.centerLng, ep.centerLat], stairRoomCode: null },
            { type: 'arrived', description: `You have arrived at ${ep.name || ep.roomCode}`, metres: 0,  location: [ep.centerLng, ep.centerLat], stairRoomCode: null },
        ]),
    ];

    const totalMetres = steps.reduce((s, x) => s + (x.metres ?? 0), 0);

    return {
        steps,
        path: fullPath,
        outdoorPathLength: outdoorCoords.length,
        totalMetres,
        totalMinutes: Math.ceil(totalMetres / 80),
        requiresStairs: indoorLeg?.requiresStairs ?? false,
        isCrossBuilding: true,
    };
}
