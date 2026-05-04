'use client';
import { useState, useEffect, useCallback } from 'react';
import { locations } from '../data/locations';
import { buildIndoorRoute } from '../lib/indoorRouter';

const R = 6371000;
function haversineM([lng1, lat1], [lng2, lat2]) {
    const r = d => d * Math.PI / 180;
    const dLat = r(lat2 - lat1), dLng = r(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// FIX 1 helpers — building-based start detection

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

function findNearestBuildingId(gpsLng, gpsLat, locs) {
    const r = d => d * Math.PI / 180;
    let best = null, bestDist = Infinity;
    for (const loc of locs) {
        const coords = loc.coordinates || [loc.lng, loc.lat];
        if (!coords?.[0]) continue;
        const dLat = r(coords[1] - gpsLat);
        const dLng = r(coords[0] - gpsLng);
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(r(gpsLat)) * Math.cos(r(coords[1])) *
            Math.sin(dLng / 2) ** 2;
        const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        if (d < bestDist) { bestDist = d; best = loc; }
    }
    return best?.buildingId ?? null;
}

// FIX 2 helpers — BFS cross-building routing

function findPathBFS(startId, endId, edges) {
    const adj = {};
    for (const e of edges) {
        if (!adj[e.from]) adj[e.from] = [];
        if (!adj[e.to])   adj[e.to]   = [];
        adj[e.from].push(e.to);
        adj[e.to].push(e.from);
    }
    const queue = [[startId]];
    const visited = new Set([startId]);
    while (queue.length) {
        const path = queue.shift();
        const cur = path[path.length - 1];
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

function haversineM2([lng1, lat1], [lng2, lat2]) {
    const r = d => d * Math.PI / 180;
    const dLat = r(lat2 - lat1), dLng = r(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function buildCrossBuildingRoute(
    startFeature, destFeature, stairs, rooms,
    campusGraph, locationsArray
) {
    const sp = startFeature.properties;
    const ep = destFeature.properties;

    const nodes = campusGraph?.campusNodes ?? campusGraph?.nodes ?? [];
    const edges = campusGraph?.campusEdges ?? campusGraph?.edges ?? [];
    const nodeMap = campusGraph?.locationNodeMap ?? {};

    const startLoc = locationsArray.find(l =>
        String(l.buildingId) === String(sp.buildingId));
    const endLoc = locationsArray.find(l =>
        String(l.buildingId) === String(ep.buildingId));

    if (!startLoc || !endLoc) return null;

    const startKey = startLoc.id?.toLowerCase();
    const endKey   = endLoc.id?.toLowerCase();
    const startNodeId = nodeMap[startKey];
    const endNodeId   = nodeMap[endKey];

    if (!startNodeId || !endNodeId) return null;

    const pathIds = findPathBFS(startNodeId, endNodeId, edges);
    if (!pathIds) return null;

    const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]));
    const outdoorCoords = pathIds
        .map(id => nodeById[id])
        .filter(Boolean)
        .map(n => [n.lng, n.lat]);

    if (outdoorCoords.length < 2) return null;

    const destEntryRoom = findStartRoomForBuilding(ep.buildingId, rooms.features);
    const indoorLeg = destEntryRoom
        ? buildIndoorRoute(destEntryRoom, destFeature, stairs)
        : null;

    // outdoorCoords runs from the start-building campus node to the end-building campus node.
    // These are already on the physical path network so they connect smoothly.
    // The indoor leg (if found) starts at destEntryRoom centroid and ends at destFeature centroid;
    // we bridge from the last outdoor node to the first indoor coord with a short straight segment.
    const indoorPath = indoorLeg?.path ?? [[ep.centerLng, ep.centerLat]];
    const fullPath = [...outdoorCoords, ...indoorPath];

    const outdoorDist = outdoorCoords.reduce((sum, c, i) => {
        if (i === 0) return sum;
        return sum + haversineM2(outdoorCoords[i - 1], c);
    }, 0);

    const exitLocation = outdoorCoords[0];
    const entryLocation = outdoorCoords[outdoorCoords.length - 1];

    const steps = [
        {
            type: 'exit_building',
            description: `Exit ${startLoc.name}`,
            metres: 0,
            location: exitLocation,
            stairRoomCode: null,
        },
        {
            type: 'walk',
            description: `Walk to ${endLoc.name}`,
            metres: Math.round(outdoorDist),
            location: entryLocation,
            stairRoomCode: null,
        },
        {
            type: 'enter_building',
            description: `Enter ${endLoc.name}`,
            metres: 0,
            location: entryLocation,
            stairRoomCode: null,
        },
        ...(indoorLeg?.steps ?? [
            {
                type: 'walk',
                description: `Walk to ${ep.name || ep.roomCode}`,
                metres: 20,
                location: [ep.centerLng, ep.centerLat],
                stairRoomCode: null,
            },
            {
                type: 'arrived',
                description: `You have arrived at ${ep.name || ep.roomCode}`,
                metres: 0,
                location: [ep.centerLng, ep.centerLat],
                stairRoomCode: null,
            },
        ]),
    ];

    const totalMetres = steps.reduce((s, x) => s + (x.metres ?? 0), 0);

    return {
        steps,
        path: fullPath,
        // Index where the outdoor section ends so IndoorOverlay can split the line
        outdoorPathLength: outdoorCoords.length,
        totalMetres,
        totalMinutes: Math.ceil(totalMetres / 80),
        requiresStairs: indoorLeg?.requiresStairs ?? false,
        isCrossBuilding: true,
    };
}

function findOutdoorLocForRoom(feature) {
    const bid = feature?.properties?.buildingId;
    if (bid == null) return null;
    return (Array.isArray(locations) ? locations : [])
        .find(loc => String(loc.buildingId) === String(bid)) ?? null;
}

/**
 * Manages indoor route state and navigation logic.
 *
 * @param {object} rooms            GeoJSON FeatureCollection of all rooms
 * @param {object} stairs           GeoJSON FeatureCollection of stair features
 * @param {object|null} gpsLocation { lng, lat } from GPS or null
 * @param {object} mapRef           ref whose .current is the Mapbox map instance
 * @param {object} campusGraph      campus graph data (nodes, edges, locationNodeMap)
 * @param {Function} onHighlightRoom   (poiId|null) => void
 * @param {Function} onClearSelectedRoom () => void
 * @param {Function} onOutdoorFallback  (destFeature, startFeature?) => void
 */
export function useIndoorNavigation({
    rooms, stairs, gpsLocation, mapRef,
    campusGraph,
    onHighlightRoom,
    onClearSelectedRoom,
    onOutdoorFallback,
}) {
    const [activeRoute,        setActiveRoute]        = useState(null);
    const [currentStepIndex,   setCurrentStepIndex]   = useState(0);
    const [arrivedMessage,     setArrivedMessage]     = useState(false);
    const [activeDestination,  setActiveDestination]  = useState(null);

    // Advance navigation step when user approaches the next waypoint
    useEffect(() => {
        if (!activeRoute || !gpsLocation) return;
        const { path, steps } = activeRoute;
        if (!path || path.length < 2) return;
        const stepFraction = (currentStepIndex + 1) / steps.length;
        const wpIdx = Math.min(Math.floor(stepFraction * (path.length - 1)), path.length - 1);
        const dist = haversineM([gpsLocation.lng, gpsLocation.lat], path[wpIdx]);
        if (dist > 8) return;
        if (currentStepIndex >= steps.length - 1) {
            setArrivedMessage(true);
            setActiveRoute(null);
            setCurrentStepIndex(0);
        } else {
            setCurrentStepIndex(i => i + 1);
        }
    }, [gpsLocation, activeRoute, currentStepIndex]);

    // Auto-dismiss arrived banner after 3 s
    useEffect(() => {
        if (!arrivedMessage) return;
        const t = setTimeout(() => setArrivedMessage(false), 3000);
        return () => clearTimeout(t);
    }, [arrivedMessage]);

    /** Navigate from GPS location (or a specific start room) to a destination room feature. */
    const handleNavigateTo = useCallback(async (destinationFeature, startFeatureOverride = null) => {
        if (!rooms?.features) return;

        let startFeature = startFeatureOverride;

        // FIX 1: use nearest building → ground-floor entry room instead of raw GPS centroid snap
        if (!startFeature && gpsLocation) {
            const nearestBuildingId = findNearestBuildingId(
                gpsLocation.lng, gpsLocation.lat,
                Array.isArray(locations) ? locations : []
            );
            if (nearestBuildingId != null) {
                startFeature = findStartRoomForBuilding(nearestBuildingId, rooms.features);
            }
        }

        if (!startFeature) {
            // No GPS and no explicit start — fall back to outdoor routing for the destination building
            onOutdoorFallback?.(destinationFeature);
            return;
        }

        const route = buildIndoorRoute(startFeature, destinationFeature, stairs);
        if (!route) {
            // FIX 3: try campus-graph cross-building route before falling back to Mapbox
            const crossRoute = await buildCrossBuildingRoute(
                startFeature,
                destinationFeature,
                stairs,
                rooms,
                campusGraph,
                Array.isArray(locations) ? locations : []
            );

            if (crossRoute) {
                setActiveRoute(crossRoute);
                setActiveDestination(destinationFeature);
                setCurrentStepIndex(0);
                setArrivedMessage(false);
                onClearSelectedRoom?.();
                onHighlightRoom?.(destinationFeature.properties.poiId);
                if (mapRef?.current && crossRoute.path.length > 1) {
                    const lngs = crossRoute.path.map(c => c[0]);
                    const lats  = crossRoute.path.map(c => c[1]);
                    mapRef.current.fitBounds(
                        [
                            [Math.min(...lngs), Math.min(...lats)],
                            [Math.max(...lngs), Math.max(...lats)],
                        ],
                        { padding: 80, duration: 1200 }
                    );
                }
                return;
            }

            // Campus graph unavailable or buildings not mapped — fall back to outdoor Mapbox routing
            onOutdoorFallback?.(destinationFeature, startFeature);
            return;
        }

        setActiveRoute(route);
        setActiveDestination(destinationFeature);
        setCurrentStepIndex(0);
        setArrivedMessage(false);
        onClearSelectedRoom?.();
        onHighlightRoom?.(destinationFeature.properties.poiId);
        const dp = destinationFeature.properties;
        if (dp.centerLng != null && dp.centerLat != null && mapRef?.current) {
            mapRef.current.flyTo({ center: [dp.centerLng, dp.centerLat], zoom: 19, duration: 1200 });
        }
    }, [gpsLocation, rooms, stairs, campusGraph, mapRef, onHighlightRoom, onClearSelectedRoom, onOutdoorFallback]);

    const handleCancelNavigation = useCallback(() => {
        setActiveRoute(null);
        setActiveDestination(null);
        setCurrentStepIndex(0);
        setArrivedMessage(false);
        onHighlightRoom?.(null);
    }, [onHighlightRoom]);

    return {
        activeRoute,
        setActiveRoute,
        activeDestination,
        currentStepIndex,
        arrivedMessage,
        handleNavigateTo,
        handleCancelNavigation,
        findOutdoorLocForRoom,
    };
}
