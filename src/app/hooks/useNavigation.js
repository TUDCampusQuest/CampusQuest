'use client';
import { useState, useEffect, useCallback } from 'react';
import { locations } from '../data/locations';
import { getRouteCoords, getChainedRoute, snapToNearestBuilding } from '../data/buildingRoutes';

const ALL_IDS = ['CAFE', 'AG-BLOCK', 'A-BLOCK', 'C-BLOCK', 'D-BLOCK',
                 'E-BLOCK', 'F-BLOCK', 'S-BLOCK', 'CONNECT', 'PARKING'];

function haversineMetres(a, b) {
    const R = 6371000;
    const toRad = d => d * Math.PI / 180;
    const dLat = toRad(b[1] - a[1]);
    const dLng = toRad(b[0] - a[0]);
    const s = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function walkingStats(coords) {
    let dist = 0;
    for (let i = 1; i < coords.length; i++) dist += haversineMetres(coords[i - 1], coords[i]);
    return { metres: Math.round(dist), minutes: Math.ceil(dist / 80) };
}

/**
 * useNavigation
 * Owns all route A→B state. MapView just reads the outputs and
 * calls the returned setters when the user taps a building pin.
 */
export function useNavigation({ isNavigating, navTarget, userLocation, mapRef }) {
    const [routeStep, setRouteStep]   = useState('IDLE');
    const [buildingA, setBuildingA]   = useState(null);
    const [buildingB, setBuildingB]   = useState(null);
    const [routeCoords, setRouteCoords] = useState(null);
    const [routeStats, setRouteStats]   = useState(null);
    const [routeError, setRouteError]   = useState(null);
    const [isChained, setIsChained]     = useState(false);

    // Fit the map to the route bounds
    const fitRouteOnMap = useCallback((coords) => {
        if (!mapRef.current || !coords?.length) return;
        const lngs = coords.map(c => c[0]);
        const lats = coords.map(c => c[1]);
        mapRef.current.fitBounds(
            [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
            { padding: 90, duration: 1000 }
        );
    }, [mapRef]);

    // When Navigate pressed — set B, snap A from GPS or ask user to pick
    useEffect(() => {
        if (isNavigating && navTarget) {
            setBuildingB(navTarget);
            setRouteCoords(null);
            setRouteStats(null);
            setRouteError(null);
            setIsChained(false);

            if (userLocation) {
                const nearest = snapToNearestBuilding(
                    [userLocation.lng, userLocation.lat], locations
                );
                if (nearest && nearest.id !== navTarget.id) {
                    setBuildingA(nearest);
                    setRouteStep('ACTIVE');
                    return;
                }
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
            setIsChained(false);
        }
    }, [isNavigating, navTarget]); // intentionally excludes userLocation

    // Resolve route whenever A and B are both known
    useEffect(() => {
        if (!buildingA || !buildingB || routeStep !== 'ACTIVE') return;
        setRouteError(null);
        setIsChained(false);

        if (buildingA.id === buildingB.id) {
            setRouteError("You're already at this building.");
            setRouteStep('ERROR');
            return;
        }
        const direct = getRouteCoords(buildingA.id, buildingB.id);
        if (direct) {
            setRouteCoords(direct);
            setRouteStats(walkingStats(direct));
            fitRouteOnMap(direct);
            return;
        }
        const chained = getChainedRoute(buildingA.id, buildingB.id, ALL_IDS);
        if (chained) {
            setRouteCoords(chained);
            setRouteStats(walkingStats(chained));
            setIsChained(true);
            fitRouteOnMap(chained);
            return;
        }
        setRouteError(`No campus path found from "${buildingA.name}" to "${buildingB.name}".`);
        setRouteStep('ERROR');
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
        routeStep, buildingA, buildingB,
        routeCoords, routeStats, routeError, isChained,
        resetToPickA, pickBuildingA,
    };
}