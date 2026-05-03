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
 * @param {Function} onHighlightRoom   (poiId|null) => void
 * @param {Function} onClearSelectedRoom () => void
 * @param {Function} onOutdoorFallback  (destFeature) => void — called when cross-building
 */
export function useIndoorNavigation({
    rooms, stairs, gpsLocation, mapRef,
    onHighlightRoom,
    onClearSelectedRoom,
    onOutdoorFallback,
}) {
    const [activeRoute,      setActiveRoute]      = useState(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [arrivedMessage,   setArrivedMessage]   = useState(false);

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
    const handleNavigateTo = useCallback((destinationFeature, startFeatureOverride = null) => {
        if (!rooms?.features) return;

        let startFeature = startFeatureOverride;
        if (!startFeature && gpsLocation) {
            let minDist = Infinity;
            for (const f of rooms.features) {
                const p = f.properties;
                if (p.centerLng == null || p.centerLat == null) continue;
                const d = haversineM([gpsLocation.lng, gpsLocation.lat], [p.centerLng, p.centerLat]);
                if (d < minDist) { minDist = d; startFeature = f; }
            }
        }

        if (!startFeature) {
            // No GPS and no explicit start — fall back to outdoor routing for the destination building
            onOutdoorFallback?.(destinationFeature);
            return;
        }

        const route = buildIndoorRoute(startFeature, destinationFeature, stairs);
        if (!route) {
            // Different buildings — pass both features so caller can set outdoor start + dest
            onOutdoorFallback?.(destinationFeature, startFeature);
            return;
        }

        setActiveRoute(route);
        setCurrentStepIndex(0);
        setArrivedMessage(false);
        onClearSelectedRoom?.();
        onHighlightRoom?.(destinationFeature.properties.poiId);
        const dp = destinationFeature.properties;
        if (dp.centerLng != null && dp.centerLat != null && mapRef?.current) {
            mapRef.current.flyTo({ center: [dp.centerLng, dp.centerLat], zoom: 19, duration: 1200 });
        }
    }, [gpsLocation, rooms, stairs, mapRef, onHighlightRoom, onClearSelectedRoom, onOutdoorFallback]);

    const handleCancelNavigation = useCallback(() => {
        setActiveRoute(null);
        setCurrentStepIndex(0);
        setArrivedMessage(false);
        onHighlightRoom?.(null);
    }, [onHighlightRoom]);

    return {
        activeRoute,
        setActiveRoute,
        currentStepIndex,
        arrivedMessage,
        handleNavigateTo,
        handleCancelNavigation,
        findOutdoorLocForRoom,
    };
}
