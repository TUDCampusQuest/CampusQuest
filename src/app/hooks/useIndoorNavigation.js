'use client';
// Builds indoor room-to-room routes, advances steps as the user walks, and falls back to outdoor routing when needed.
import { useState, useEffect, useCallback } from 'react';
import { locations } from '../data/locations';
import { buildIndoorRoute } from '../lib/indoorRouter';
import { haversineM } from '../lib/routeUtils';
import { buildCrossBuildingRoute } from '../lib/crossBuildingRoute';

const R = 6371000;
const MAX_SNAP_METRES = 300;

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
            Math.cos(r(gpsLat)) * Math.cos(r(coords[1])) * Math.sin(dLng / 2) ** 2;
        const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        if (d < bestDist) { bestDist = d; best = loc; }
    }
    if (bestDist > MAX_SNAP_METRES) return null;
    return best?.buildingId ?? null;
}

function findOutdoorLocForRoom(feature) {
    const bid = feature?.properties?.buildingId;
    if (bid == null) return null;
    return (Array.isArray(locations) ? locations : [])
        .find(loc => String(loc.buildingId) === String(bid)) ?? null;
}

export function useIndoorNavigation({
    rooms, stairs, gpsLocation, mapRef,
    campusGraph,
    onHighlightRoom,
    onClearSelectedRoom,
    onOutdoorFallback,
    onFloorChange,
    activeNavSystem,
}) {
    const [activeRoute,       setActiveRoute]       = useState(null);
    const [currentStepIndex,  setCurrentStepIndex]  = useState(0);
    const [arrivedMessage,    setArrivedMessage]    = useState(false);
    const [activeDestination, setActiveDestination] = useState(null);

    useEffect(() => {
        if (!activeRoute || !gpsLocation) return;
        if (activeNavSystem !== 'indoor') return;
        if (activeRoute.isCrossBuilding) return;
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
            const nextStep = steps[currentStepIndex + 1];
            setCurrentStepIndex(i => i + 1);
            if (nextStep?.location && mapRef?.current) {
                try {
                    mapRef.current.flyTo({ center: nextStep.location, zoom: 19, duration: 800 });
                } catch (err) {
                    console.warn('flyTo indoor step suppressed:', err?.message || err);
                }
            }
        }
    }, [gpsLocation, activeRoute, currentStepIndex, activeNavSystem]);

    useEffect(() => {
        if (!arrivedMessage) return;
        const t = setTimeout(() => setArrivedMessage(false), 3000);
        return () => clearTimeout(t);
    }, [arrivedMessage]);

    const handleNavigateTo = useCallback(async (destinationFeature, startFeatureOverride = null) => {
        if (!rooms?.features) return;

        let startFeature = startFeatureOverride;

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
            onOutdoorFallback?.(destinationFeature);
            return;
        }

        try {
            const route = buildIndoorRoute(startFeature, destinationFeature, stairs);
            if (!route) {
                const crossRoute = await buildCrossBuildingRoute(
                    startFeature, destinationFeature, stairs, rooms, campusGraph
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
                        try {
                            mapRef.current.fitBounds(
                                [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
                                { padding: 80, duration: 1200 }
                            );
                        } catch (err) {
                            console.warn('fitBounds cross-building suppressed:', err?.message || err);
                        }
                    }
                    const destFloor = destinationFeature.properties.floorName;
                    if (destFloor && destFloor !== 'G') onFloorChange?.(destFloor, true);
                    return;
                }

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
                try {
                    mapRef.current.flyTo({ center: [dp.centerLng, dp.centerLat], zoom: 19, duration: 1200 });
                } catch (err) {
                    console.warn('flyTo destination suppressed:', err?.message || err);
                }
            }

            const destFloor = dp.floorName;
            if (destFloor && destFloor !== 'G') onFloorChange?.(destFloor, true);
        } catch (err) {
            console.error('handleNavigateTo error:', err);
        }
    }, [gpsLocation, rooms, stairs, campusGraph, mapRef, onHighlightRoom, onClearSelectedRoom, onOutdoorFallback, onFloorChange]);

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
