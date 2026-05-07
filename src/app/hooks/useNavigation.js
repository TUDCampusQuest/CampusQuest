'use client';
// Handles outdoor building-to-building routing — resolves campus graph paths, Mapbox walking routes, and hybrid combinations.
import { useState, useEffect, useCallback, useRef } from 'react';
import {
    haversineM, walkingStats,
    toLocationMapKey, routeBetweenNodeIds, fetchMapboxRoute,
    buildHybridRouteFromCoordsToCampus, buildHybridRouteFromCampusToCoords,
} from '../lib/routeUtils';
import { filterToCampus } from '../lib/campusBounds';

let campusNodes = [];
let campusEdges = [];
let locationNodeMap = {};

const PATCHED_NODES = [
    { id: 'a_block_entrance', lng: -6.376366, lat: 53.406213, type: 'entrance', name: 'A Block entrance' },
    { id: 'ave_1', lng: -6.376465, lat: 53.406013, type: 'junction', name: 'Campus ave 1' },
    { id: 'ave_2', lng: -6.376743, lat: 53.406060, type: 'junction', name: 'Campus ave 2' },
    { id: 'ave_3', lng: -6.377333, lat: 53.406073, type: 'junction', name: 'Campus ave 3' },
    { id: 'ave_4', lng: -6.377838, lat: 53.406043, type: 'junction', name: 'Campus ave 4' },
    { id: 'ave_5', lng: -6.378081, lat: 53.406014, type: 'junction', name: 'Campus ave 5' },
    { id: 'ave_6', lng: -6.378286, lat: 53.405960, type: 'junction', name: 'Campus ave 6' },
    { id: 'ave_7', lng: -6.378434, lat: 53.405914, type: 'junction', name: 'Campus ave — south turn' },
    { id: 'ave_s1', lng: -6.377900, lat: 53.405870, type: 'junction', name: 'Campus ave south 1' },
    { id: 'ave_s2', lng: -6.377700, lat: 53.405700, type: 'junction', name: 'Campus ave south 2' },
    { id: 'ave_s3', lng: -6.377700, lat: 53.405450, type: 'junction', name: 'Campus ave south 3' },
    { id: 'ave_s4', lng: -6.377900, lat: 53.405200, type: 'junction', name: 'Campus ave south 4' },
    { id: 'ave_s5', lng: -6.378300, lat: 53.405000, type: 'junction', name: 'Campus ave south 5' },
    { id: 'ave_s6', lng: -6.378700, lat: 53.404800, type: 'junction', name: 'Campus ave south 6' },
    // Car park nodes
    { id: 'carpark_n', lng: -6.378200, lat: 53.404550, type: 'junction', name: 'Car park north entrance' },
    { id: 'carpark_nw', lng: -6.378800, lat: 53.404400, type: 'junction', name: 'Car park northwest' },
    { id: 'carpark_ne', lng: -6.377500, lat: 53.404400, type: 'junction', name: 'Car park northeast' },
    { id: 'carpark_mid', lng: -6.378100, lat: 53.404150, type: 'junction', name: 'Car park mid lane' },
    { id: 'carpark_sw', lng: -6.378800, lat: 53.403900, type: 'junction', name: 'Car park southwest' },
    { id: 'carpark_se', lng: -6.377400, lat: 53.403900, type: 'junction', name: 'Car park southeast' },
    { id: 'carpark_s', lng: -6.378100, lat: 53.403650, type: 'junction', name: 'Car park south exit' },
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
    { from: 'ave_s6', to: 'main_1' },
    // Car park connections
    { from: 'main_1',      to: 'carpark_n' },
    { from: 'carpark_n',   to: 'carpark_nw' },
    { from: 'carpark_n',   to: 'carpark_ne' },
    { from: 'carpark_nw',  to: 'carpark_mid' },
    { from: 'carpark_ne',  to: 'carpark_mid' },
    { from: 'carpark_mid', to: 'carpark_sw' },
    { from: 'carpark_mid', to: 'carpark_se' },
    { from: 'carpark_sw',  to: 'carpark_s' },
    { from: 'carpark_se',  to: 'carpark_s' },
];

const PATCHED_NODE_MAP = { 'a-block': 'a_block_entrance' };

const campusEntryNodeIds = [
    'main_1', 'main_8', 'student_services_entrance', 'd_block_approach', 'a_block_entrance',
];

// checks if a location has a campus graph node (if it is on campus)
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

// resolves a campus-only route directly from the graph node map
function routeFromGraph(startLocation, endLocation) {
    const startKey = toLocationMapKey(startLocation.id);
    const endKey = toLocationMapKey(endLocation.id);
    const startNodeId = locationNodeMap[startKey];
    const endNodeId = locationNodeMap[endKey];
    if (!startNodeId || !endNodeId) {
        console.error('Missing locationNodeMap entry', { startLocationId: startLocation.id, endLocationId: endLocation.id });
        return { error: 'Missing node mapping for one or both buildings.' };
    }
    const result = routeBetweenNodeIds(startNodeId, endNodeId, campusNodes, campusEdges);
    if (result.error) return result;

    const startIconCoord = startLocation.coordinates || [startLocation.lng, startLocation.lat];
    const coords = [startIconCoord, ...result.coords];
    return { coords, pathIds: result.pathIds };
}

export function useNavigation({ isNavigating, navTarget, navStart, userLocation, mapRef, campusGraph, isIndoorActive }) {
    useEffect(() => {
        if (!campusGraph) return;
        campusNodes = [...(campusGraph.campusNodes || campusGraph.nodes || []), ...PATCHED_NODES];
        campusEdges = [...(campusGraph.campusEdges || campusGraph.edges || []), ...PATCHED_EDGES];
        locationNodeMap = { ...(campusGraph.locationNodeMap || {}), ...PATCHED_NODE_MAP };
    }, [campusGraph]);

    const userLocationRef = useRef(userLocation);
    const isIndoorActiveRef = useRef(isIndoorActive);
    const pickARequestedRef = useRef(false);
    const wasNavigatingRef = useRef(false);
    const buildingARef = useRef(null);
    const routeIdRef = useRef(0);
    const prevNavTargetIdRef = useRef(null);
    const prevNavStartIdRef = useRef(null);

    useEffect(() => { userLocationRef.current = userLocation; });
    useEffect(() => { isIndoorActiveRef.current = isIndoorActive; }, [isIndoorActive]);

    const [routeStep, setRouteStep] = useState('IDLE');
    const [buildingA, setBuildingA] = useState(null);
    const [buildingB, setBuildingB] = useState(null);
    const [routeCoords, setRouteCoords] = useState(null);
    const [routeStats, setRouteStats] = useState(null);
    const [routeError, setRouteError] = useState(null);

    useEffect(() => { buildingARef.current = buildingA; }, [buildingA]);

    const fitRouteOnMapRef = useRef(null);
    fitRouteOnMapRef.current = (coords) => {
        if (isIndoorActiveRef.current) return;
        if (!mapRef.current || !coords?.length) return;
        const loc = userLocationRef.current;
        if (loc && haversineM([loc.lng, loc.lat], [-6.3779, 53.4059]) > 2000) return;
        const safeCoords = filterToCampus(coords);
        if (safeCoords.length < 2) return;
        const lngs = safeCoords.map(c => c[0]);
        const lats  = safeCoords.map(c => c[1]);
        try {
            mapRef.current.fitBounds(
                [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
                { padding: 90, duration: 1000 }
            );
        } catch (err) {
            console.warn('fitBounds suppressed:', err?.message || err);
        }
    };

    const navTargetId = navTarget?.id ?? null;
    const navStartId = navStart?.id ?? null;

    useEffect(() => {
        if (isNavigating && navTarget) {
            const targetChanged = navTargetId !== prevNavTargetIdRef.current;
            const startChanged = navStartId !== prevNavStartIdRef.current;
            const isMidNavSwap = wasNavigatingRef.current;

                if (targetChanged || startChanged || !isMidNavSwap) {
                prevNavTargetIdRef.current = navTargetId;
                prevNavStartIdRef.current = navStartId;
                wasNavigatingRef.current = true;

                setBuildingB(navTarget);
                setRouteCoords(null);
                setRouteStats(null);
                setRouteError(null);
                pickARequestedRef.current = false;

                if (navStart) {
                    setBuildingA(navStart);
                    setRouteStep('ACTIVE');
                    return;
                }

                if (isMidNavSwap && buildingARef.current && !targetChanged) {
                    setRouteStep('ACTIVE');
                    return;
                }

                const currentUserLocation = userLocationRef.current;
                if (!pickARequestedRef.current && currentUserLocation) {
                    setBuildingA(null);
                    setRouteStep('ACTIVE');
                    return;
                }

                setBuildingA(null);
                setRouteStep('PICK_A');
            }
        }

        if (!isNavigating) {
            prevNavTargetIdRef.current = null;
            prevNavStartIdRef.current = null;
            wasNavigatingRef.current = false;
            pickARequestedRef.current = false;
            setRouteStep('IDLE');
            setBuildingA(null);
            setBuildingB(null);
            setRouteCoords(null);
            setRouteStats(null);
            setRouteError(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isNavigating, navTargetId, navStartId]);

    useEffect(() => {
        if (!buildingB || routeStep !== 'ACTIVE') return;

        let cancelled = false;
        const myId = ++routeIdRef.current;

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
                        if (result.error) { setRouteError(result.error); setRouteStep('ERROR'); return; }
                        if (cancelled || myId !== routeIdRef.current) return;
                        setRouteCoords(result.coords);
                        setRouteStats(walkingStats(result.coords));
                        fitRouteOnMapRef.current(result.coords);
                        return;
                    }

                    if (routingMode === 'mapbox') {
                        const startCoords = buildingA.coordinates || [buildingA.lng, buildingA.lat];
                        const endCoords = buildingB.coordinates || [buildingB.lng, buildingB.lat];
                        const result = await fetchMapboxRoute(startCoords, endCoords);
                        if (result.error) { setRouteError(result.error); setRouteStep('ERROR'); return; }
                        if (cancelled || myId !== routeIdRef.current) return;
                        setRouteCoords(result.coords);
                        setRouteStats(walkingStats(result.coords));
                        fitRouteOnMapRef.current(result.coords);
                        return;
                    }

                    if (routingMode === 'hybrid') {
                        const startOnCampus = isCampusLocation(buildingA);
                        const endOnCampus = isCampusLocation(buildingB);

                        if (!startOnCampus && endOnCampus) {
                            const startCoords = buildingA.coordinates || [buildingA.lng, buildingA.lat];
                            const result = await buildHybridRouteFromCoordsToCampus(
                                startCoords, buildingB, campusNodes, campusEdges, locationNodeMap, campusEntryNodeIds
                            );
                            if (result.error) { setRouteError(result.error); setRouteStep('ERROR'); return; }
                            if (cancelled || myId !== routeIdRef.current) return;
                            setRouteCoords(result.coords);
                            setRouteStats(walkingStats(result.coords));
                            fitRouteOnMapRef.current(result.coords);
                            return;
                        }

                        if (startOnCampus && !endOnCampus) {
                            const endCoords = buildingB.coordinates || [buildingB.lng, buildingB.lat];
                            const result = await buildHybridRouteFromCampusToCoords(
                                buildingA, endCoords, campusNodes, campusEdges, locationNodeMap, campusEntryNodeIds
                            );
                            if (result.error) { setRouteError(result.error); setRouteStep('ERROR'); return; }
                            if (cancelled || myId !== routeIdRef.current) return;
                            setRouteCoords(result.coords);
                            setRouteStats(walkingStats(result.coords));
                            fitRouteOnMapRef.current(result.coords);
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

                    if (!isCampusLocation(buildingB)) {
                        const endCoords = buildingB.coordinates || [buildingB.lng, buildingB.lat];
                        const result = await fetchMapboxRoute(startCoords, endCoords);
                        if (result.error) { setRouteError(result.error); setRouteStep('ERROR'); return; }
                        if (cancelled || myId !== routeIdRef.current) return;
                        setRouteCoords(result.coords);
                        setRouteStats(walkingStats(result.coords));
                        fitRouteOnMapRef.current(result.coords);
                        return;
                    }

                    const result = await buildHybridRouteFromCoordsToCampus(
                        startCoords, buildingB, campusNodes, campusEdges, locationNodeMap, campusEntryNodeIds
                    );
                    if (result.error) { setRouteError(result.error); setRouteStep('ERROR'); return; }
                    if (cancelled || myId !== routeIdRef.current) return;
                    setRouteCoords(result.coords);
                    setRouteStats(walkingStats(result.coords));
                    fitRouteOnMapRef.current(result.coords);
                    return;
                }

                setRouteError('Could not determine a route.');
                setRouteStep('ERROR');
            } catch (err) {
                if (!cancelled && myId === routeIdRef.current) {
                    setRouteError('Failed to build route.');
                    setRouteStep('ERROR');
                }
            }
        }

        resolveRoute();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [buildingA, buildingB, routeStep]);

    // lets the user manually pick a new start point mid-navigation
    const resetToPickA = useCallback(() => {
        pickARequestedRef.current = true;
        setBuildingA(null);
        setRouteCoords(null);
        setRouteStats(null);
        setRouteError(null);
        setRouteStep('PICK_A');
    }, []);

    const pickBuildingA = useCallback((loc) => {
        pickARequestedRef.current = false;
        setRouteCoords(null);
        setRouteStats(null);
        setRouteError(null);
        setBuildingA(loc);
        setRouteStep('ACTIVE');
    }, []);

    return { routeStep, buildingA, buildingB, routeCoords, routeStats, routeError, resetToPickA, pickBuildingA };
}
