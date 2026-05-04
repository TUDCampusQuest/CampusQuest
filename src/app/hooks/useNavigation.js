'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { locations } from '../data/locations';

// Populated at runtime from the campusGraph prop — avoids importing the deleted local file
let campusNodes = [];
let campusEdges = [];
let locationNodeMap = {};

// Local corrections for wrong/missing entries in the S3 campus graph.
// Keep in sync with GRAPH_NODE_PATCHES / GRAPH_EDGE_PATCHES in useIndoorNavigation.js.
const PATCHED_NODES = [
    { id: 'a_block_entrance', lng: -6.376366,  lat: 53.406213,  type: 'entrance', name: 'A Block entrance' },
    { id: 'ave_1',  lng: -6.376465, lat: 53.406013, type: 'junction', name: 'Campus ave 1' },
    { id: 'ave_2',  lng: -6.376743, lat: 53.406060, type: 'junction', name: 'Campus ave 2' },
    { id: 'ave_3',  lng: -6.377333, lat: 53.406073, type: 'junction', name: 'Campus ave 3' },
    { id: 'ave_4',  lng: -6.377838, lat: 53.406043, type: 'junction', name: 'Campus ave 4' },
    { id: 'ave_5',  lng: -6.378081, lat: 53.406014, type: 'junction', name: 'Campus ave 5' },
    { id: 'ave_6',  lng: -6.378286, lat: 53.405960, type: 'junction', name: 'Campus ave 6' },
    { id: 'ave_7',  lng: -6.378434, lat: 53.405914, type: 'junction', name: 'Campus ave — south turn' },
    { id: 'ave_s1', lng: -6.378537, lat: 53.405883, type: 'junction', name: 'Campus ave south 1' },
    { id: 'ave_s2', lng: -6.378745, lat: 53.405781, type: 'junction', name: 'Campus ave south 2' },
    { id: 'ave_s3', lng: -6.378910, lat: 53.405698, type: 'junction', name: 'Campus ave south 3' },
    { id: 'ave_s4', lng: -6.379008, lat: 53.405641, type: 'junction', name: 'Campus ave south 4' },
    { id: 'ave_s5', lng: -6.379076, lat: 53.405580, type: 'junction', name: 'Campus ave south 5' },
    { id: 'ave_s6', lng: -6.379208, lat: 53.405459, type: 'junction', name: 'Campus ave south 6' },
    { id: 'ave_s7', lng: -6.379336, lat: 53.405343, type: 'junction', name: 'Campus ave south 7' },
    { id: 'ave_s8', lng: -6.379622, lat: 53.405128, type: 'junction', name: 'Campus ave south 8' },
    { id: 'ave_s9', lng: -6.379645, lat: 53.405112, type: 'junction', name: 'Campus ave south 9' },
];
const PATCHED_EDGES = [
    { from: 'a_block_entrance', to: 'ave_1' },
    { from: 'ave_1',  to: 'ave_2' },
    { from: 'ave_2',  to: 'ave_3' },
    { from: 'ave_3',  to: 'ave_4' },
    { from: 'ave_4',  to: 'ave_5' },
    { from: 'ave_5',  to: 'ave_6' },
    { from: 'ave_6',  to: 'ave_7' },
    { from: 'ave_7',  to: 'ave_s1' },
    { from: 'ave_s1', to: 'ave_s2' },
    { from: 'ave_s2', to: 'ave_s3' },
    { from: 'ave_s3', to: 'ave_s4' },
    { from: 'ave_s4', to: 'ave_s5' },
    { from: 'ave_s5', to: 'ave_s6' },
    { from: 'ave_s6', to: 'ave_s7' },
    { from: 'ave_s7', to: 'ave_s8' },
    { from: 'ave_s8', to: 'ave_s9' },
    { from: 'ave_s9', to: 'student_services_entrance' },
];
const PATCHED_NODE_MAP = {
    'a-block': 'a_block_entrance',
};

const campusEntryNodeIds = [
    'main_1',
    'main_8',
    'student_services_entrance',
    'd_block_approach',
    'a_block_entrance',
];

function haversineMetres(a, b) {
    const R = 6371000;
    const toRad = d => d * Math.PI / 180;
    const dLat = toRad(b[1] - a[1]);
    const dLng = toRad(b[0] - a[0]);
    const s =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function walkingStats(coords) {
    let dist = 0;
    for (let i = 1; i < coords.length; i++) {
        dist += haversineMetres(coords[i - 1], coords[i]);
    }
    return { metres: Math.round(dist), minutes: Math.ceil(dist / 80) };
}

function snapToNearestBuilding(userCoords, buildings) {
    if (!userCoords || !buildings?.length) return null;

    let nearest = null;
    let best = Infinity;

    for (const b of buildings) {
        const coords = b.coordinates || [b.lng, b.lat];
        if (!coords || coords.length < 2) continue;

        const d = haversineMetres(userCoords, coords);
        if (d < best) {
            best = d;
            nearest = b;
        }
    }

    return nearest;
}

function buildAdjacency(edges) {
    const graph = {};

    for (const edge of edges) {
        if (!graph[edge.from]) graph[edge.from] = [];
        if (!graph[edge.to]) graph[edge.to] = [];

        graph[edge.from].push(edge.to);
        graph[edge.to].push(edge.from);
    }

    return graph;
}

function findPathBFS(startId, endId, edges) {
    const graph = buildAdjacency(edges);
    const queue = [[startId]];
    const visited = new Set([startId]);

    while (queue.length > 0) {
        const path = queue.shift();
        const current = path[path.length - 1];

        if (current === endId) return path;

        for (const neighbor of graph[current] || []) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push([...path, neighbor]);
            }
        }
    }

    return null;
}

function toLocationMapKey(id) {
    if (!id) return '';
    return String(id).trim().toLowerCase();
}

function isCampusLocation(loc) {
    if (!loc?.id) return false;
    return !!locationNodeMap[toLocationMapKey(loc.id)];
}

function getRoutingMode(start, end) {
    const startOnCampus = isCampusLocation(start);
    const endOnCampus = isCampusLocation(end);

    if (startOnCampus && endOnCampus) return 'campus';
    if (!startOnCampus && !endOnCampus) return 'mapbox';
    return 'hybrid';
}

function getNodeCoords(nodeId) {
    const node = campusNodes.find(n => n.id === nodeId);
    if (!node) return null;
    return [node.lng, node.lat];
}

function routeBetweenNodeIds(startNodeId, endNodeId) {
    const pathIds = findPathBFS(startNodeId, endNodeId, campusEdges);

    if (!pathIds) {
        console.error('No graph path found between node ids', { startNodeId, endNodeId });
        return { error: 'No graph path found between node ids.' };
    }

    const nodeMap = Object.fromEntries(campusNodes.map(n => [n.id, n]));

    const coords = pathIds.map(id => {
        const node = nodeMap[id];
        if (!node) {
            throw new Error(`Node "${id}" was referenced but not found in campusNodes.`);
        }
        return [node.lng, node.lat];
    });

    return { coords, pathIds };
}

function routeFromGraph(startLocation, endLocation) {
    const startKey = toLocationMapKey(startLocation.id);
    const endKey = toLocationMapKey(endLocation.id);

    const startNodeId = locationNodeMap[startKey];
    const endNodeId = locationNodeMap[endKey];

    if (!startNodeId || !endNodeId) {
        console.error('Missing locationNodeMap entry', {
            startLocationId: startLocation.id,
            endLocationId: endLocation.id,
            startKey,
            endKey,
        });
        return { error: 'Missing node mapping for one or both buildings.' };
    }

    const result = routeBetweenNodeIds(startNodeId, endNodeId);
    if (result.error) return result;

    return { coords: result.coords, pathIds: result.pathIds };
}

async function fetchMapboxRoute(startCoords, endCoords) {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
        return { error: 'Missing Mapbox access token.' };
    }

    const url =
        `https://api.mapbox.com/directions/v5/mapbox/walking/` +
        `${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}` +
        `?geometries=geojson&overview=full&access_token=${token}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (!data?.routes?.length) {
            console.error('No Mapbox route found:', data);
            return { error: 'No Mapbox route found.' };
        }

        const coords = data.routes[0].geometry.coordinates;
        return { coords };
    } catch (err) {
        console.error('Mapbox route fetch failed:', err);
        return { error: 'Failed to fetch Mapbox route.' };
    }
}

async function buildHybridRouteFromCoordsToCampus(startCoords, endLocation) {
    const endKey = toLocationMapKey(endLocation.id);
    const endNodeId = locationNodeMap[endKey];

    if (!endNodeId) {
        console.error('Missing campus node mapping for hybrid destination', {
            endLocationId: endLocation.id,
            endKey,
        });
        return { error: 'Missing campus node mapping for destination.' };
    }

    let bestOption = null;

    for (const entryNodeId of campusEntryNodeIds) {
        const entryCoords = getNodeCoords(entryNodeId);
        if (!entryCoords) continue;

        const mapboxPart = await fetchMapboxRoute(startCoords, entryCoords);
        if (mapboxPart.error) continue;

        const campusPart = routeBetweenNodeIds(entryNodeId, endNodeId);
        if (campusPart.error) continue;

        const mergedCoords = [
            ...mapboxPart.coords,
            ...campusPart.coords.slice(1),
        ];

        const totalMetres = walkingStats(mergedCoords).metres;

        if (!bestOption || totalMetres < bestOption.totalMetres) {
            bestOption = {
                coords: mergedCoords,
                totalMetres,
                entryNodeId,
                campusPathIds: campusPart.pathIds,
            };
        }
    }

    if (!bestOption) {
        return { error: 'No hybrid route could be built.' };
    }

    return {
        coords: bestOption.coords,
        entryNodeId: bestOption.entryNodeId,
        campusPathIds: bestOption.campusPathIds,
    };
}

async function buildHybridRouteFromCampusToCoords(startLocation, endCoords) {
    const startKey = toLocationMapKey(startLocation.id);
    const startNodeId = locationNodeMap[startKey];

    if (!startNodeId) {
        console.error('Missing campus node mapping for hybrid start', {
            startLocationId: startLocation.id,
            startKey,
        });
        return { error: 'Missing campus node mapping for start location.' };
    }

    let bestOption = null;

    for (const entryNodeId of campusEntryNodeIds) {
        const entryCoords = getNodeCoords(entryNodeId);
        if (!entryCoords) continue;

        const campusPart = routeBetweenNodeIds(startNodeId, entryNodeId);
        if (campusPart.error) continue;

        const mapboxPart = await fetchMapboxRoute(entryCoords, endCoords);
        if (mapboxPart.error) continue;

        const mergedCoords = [
            ...campusPart.coords,
            ...mapboxPart.coords.slice(1),
        ];

        const totalMetres = walkingStats(mergedCoords).metres;

        if (!bestOption || totalMetres < bestOption.totalMetres) {
            bestOption = {
                coords: mergedCoords,
                totalMetres,
                entryNodeId,
                campusPathIds: campusPart.pathIds,
            };
        }
    }

    if (!bestOption) {
        return { error: 'No hybrid route could be built.' };
    }

    return {
        coords: bestOption.coords,
        entryNodeId: bestOption.entryNodeId,
        campusPathIds: bestOption.campusPathIds,
    };
}
export function useNavigation({ isNavigating, navTarget, navStart, userLocation, mapRef, campusGraph }) {
    // Sync S3-fetched graph data into module-level vars so all helper functions pick it up.
    // Merge with local patches to fix missing/wrong S3 entries.
    useEffect(() => {
        if (!campusGraph) return;
        campusNodes     = [...(campusGraph.campusNodes || campusGraph.nodes || []), ...PATCHED_NODES];
        campusEdges     = [...(campusGraph.campusEdges || campusGraph.edges || []), ...PATCHED_EDGES];
        locationNodeMap = { ...(campusGraph.locationNodeMap || {}), ...PATCHED_NODE_MAP };
    }, [campusGraph]);

    // Capture latest userLocation in a ref so the route-calculation effect can read it
    // without re-running on every GPS update (which caused repeated fitRouteOnMap calls).
    const userLocationRef = useRef(userLocation);
    useEffect(() => { userLocationRef.current = userLocation; });
    const [routeStep, setRouteStep] = useState('IDLE');
    const [buildingA, setBuildingA] = useState(null);
    const [buildingB, setBuildingB] = useState(null);
    const [routeCoords, setRouteCoords] = useState(null);
    const [routeStats, setRouteStats] = useState(null);
    const [routeError, setRouteError] = useState(null);
    const fitRouteOnMap = useCallback((coords) => {
        if (!mapRef.current || !coords?.length) return;

        const lngs = coords.map(c => c[0]);
        const lats = coords.map(c => c[1]);

        mapRef.current.fitBounds(
            [
                [Math.min(...lngs), Math.min(...lats)],
                [Math.max(...lngs), Math.max(...lats)],
            ],
            { padding: 90, duration: 1000 }
        );
    }, [mapRef]);

    useEffect(() => {
        if (isNavigating && navTarget) {
            setBuildingB(navTarget);
            setRouteCoords(null);
            setRouteStats(null);
            setRouteError(null);

            // Explicit start override from NavigationDrawer — skip GPS/snap logic
            if (navStart) {
                setBuildingA(navStart);
                setRouteStep('ACTIVE');
                return;
            }

            if (userLocation) {
                const userCoords = [userLocation.lng, userLocation.lat];
                const nearest = snapToNearestBuilding(userCoords, locations);

                if (nearest && nearest.id !== navTarget.id) {
                    const nearestCoords = nearest.coordinates || [nearest.lng, nearest.lat];
                    const distToNearest = haversineMetres(userCoords, nearestCoords);
                    if (distToNearest <= 150) {
                        setBuildingA(nearest);
                    }
                }

                setRouteStep('ACTIVE');
                return;
            }

            setBuildingA(null);
            setRouteStep('PICK_A');
        }

        if (!isNavigating) {
            setRouteStep('IDLE');
            setBuildingA(null);
            setBuildingB(null);
            setRouteCoords(null);
            setRouteStats(null);
            setRouteError(null);
        }
    }, [isNavigating, navTarget, navStart, userLocation]);

    useEffect(() => {
        if (!buildingB || routeStep !== 'ACTIVE') return;

        let cancelled = false;

        async function resolveRoute() {
            setRouteError(null);

            try {
                if (buildingA) {
                    if (buildingA.id === buildingB.id) {
                        setRouteError("You're already at this building.");
                        setRouteStep('ERROR');
                        return;
                    }

                    const routingMode = getRoutingMode(buildingA, buildingB);

                    if (routingMode === 'campus') {
                        const result = routeFromGraph(buildingA, buildingB);

                        if (result.error) {
                            setRouteError(result.error);
                            setRouteStep('ERROR');
                            return;
                        }

                        if (cancelled) return;
                        setRouteCoords(result.coords);
                        setRouteStats(walkingStats(result.coords));
                        fitRouteOnMap(result.coords);
                        return;
                    }

                    if (routingMode === 'mapbox') {
                        const startCoords = buildingA.coordinates || [buildingA.lng, buildingA.lat];
                        const endCoords = buildingB.coordinates || [buildingB.lng, buildingB.lat];
                        const result = await fetchMapboxRoute(startCoords, endCoords);

                        if (result.error) {
                            setRouteError(result.error);
                            setRouteStep('ERROR');
                            return;
                        }

                        if (cancelled) return;
                        setRouteCoords(result.coords);
                        setRouteStats(walkingStats(result.coords));
                        fitRouteOnMap(result.coords);
                        return;
                    }

                    if (routingMode === 'hybrid') {
                        const startOnCampus = isCampusLocation(buildingA);
                        const endOnCampus = isCampusLocation(buildingB);

                        if (!startOnCampus && endOnCampus) {
                            const startCoords = buildingA.coordinates || [buildingA.lng, buildingA.lat];
                            const result = await buildHybridRouteFromCoordsToCampus(startCoords, buildingB);

                            if (result.error) {
                                setRouteError(result.error);
                                setRouteStep('ERROR');
                                return;
                            }

                            if (cancelled) return;
                            setRouteCoords(result.coords);
                            setRouteStats(walkingStats(result.coords));
                            fitRouteOnMap(result.coords);
                            return;
                        }

                        if (startOnCampus && !endOnCampus) {
                            const endCoords = buildingB.coordinates || [buildingB.lng, buildingB.lat];
                            const result = await buildHybridRouteFromCampusToCoords(buildingA, endCoords);

                            if (result.error) {
                                setRouteError(result.error);
                                setRouteStep('ERROR');
                                return;
                            }

                            if (cancelled) return;
                            setRouteCoords(result.coords);
                            setRouteStats(walkingStats(result.coords));
                            fitRouteOnMap(result.coords);
                            return;
                        }

                        setRouteError('Unsupported hybrid routing case.');
                        setRouteStep('ERROR');
                        return;
                    }
                }

                const currentUserLocation = userLocationRef.current;
                if (!buildingA && currentUserLocation) {
                    const startCoords = [currentUserLocation.lng, currentUserLocation.lat];

                    // Destination is a synthetic room object (not in the campus graph) —
                    // use direct Mapbox routing rather than the campus hybrid system.
                    if (!isCampusLocation(buildingB)) {
                        const endCoords = buildingB.coordinates || [buildingB.lng, buildingB.lat];
                        const result = await fetchMapboxRoute(startCoords, endCoords);
                        if (result.error) { setRouteError(result.error); setRouteStep('ERROR'); return; }
                        if (cancelled) return;
                        setRouteCoords(result.coords);
                        setRouteStats(walkingStats(result.coords));
                        fitRouteOnMap(result.coords);
                        return;
                    }

                    const result = await buildHybridRouteFromCoordsToCampus(startCoords, buildingB);

                    if (result.error) {
                        setRouteError(result.error);
                        setRouteStep('ERROR');
                        return;
                    }

                    if (cancelled) return;
                    setRouteCoords(result.coords);
                    setRouteStats(walkingStats(result.coords));
                    fitRouteOnMap(result.coords);
                    return;
                }

                setRouteError('Could not determine a route.');
                setRouteStep('ERROR');
            } catch (err) {
                if (!cancelled) {
                    setRouteError('Failed to build route.');
                    setRouteStep('ERROR');
                }
            }
        }

        resolveRoute();

        return () => {
            cancelled = true;
        };
    // userLocation intentionally excluded — read via ref to avoid re-routing on every GPS tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [buildingA, buildingB, routeStep, fitRouteOnMap]);

    const resetToPickA = useCallback(() => {
        setBuildingA(null);
        setRouteCoords(null);
        setRouteStats(null);
        setRouteError(null);
        setRouteStep('PICK_A');
    }, []);

    const pickBuildingA = useCallback((loc) => {
        setBuildingA(loc);
        setRouteStep('ACTIVE');
    }, []);

    return {
        routeStep,
        buildingA,
        buildingB,
        routeCoords,
        routeStats,
        routeError,
        resetToPickA,
        pickBuildingA,
    };
}