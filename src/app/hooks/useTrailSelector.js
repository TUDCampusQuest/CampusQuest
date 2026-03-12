'use client';
import { useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import trailPaths from '../data/trailPaths';

/**
 * useTrailSelector
 * Manages the active trail from the URL ?trail= param,
 * builds GeoJSON for the map layers, and handles map click recording.
 */
export function useTrailSelector({ captureMode, setCapturedPoints, mapRef }) {
    const router       = useRouter();
    const pathname     = usePathname();
    const searchParams = useSearchParams();

    const selectedTrailName = searchParams.get('trail');

    const selectedTrailCoords = useMemo(() => {
        const coords = selectedTrailName ? trailPaths[selectedTrailName] : null;
        return Array.isArray(coords) && coords.length > 0 ? coords : null;
    }, [selectedTrailName]);

    const setTrailInUrl = useCallback((trailKey) => {
        const params = new URLSearchParams(searchParams);
        if (trailKey && trailKey !== selectedTrailName) params.set('trail', trailKey);
        else params.delete('trail');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, selectedTrailName, pathname, router]);

    // Fit map to selected trail bounds
    useEffect(() => {
        if (!selectedTrailCoords?.length || !mapRef.current) return;
        try {
            const lngs = selectedTrailCoords.map(p => p[0]);
            const lats = selectedTrailCoords.map(p => p[1]);
            if (lngs.some(isNaN) || lats.some(isNaN)) return;
            mapRef.current.fitBounds(
                [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
                { padding: 80, duration: 1000 }
            );
        } catch (err) { console.error('Bounds error:', err); }
    }, [selectedTrailCoords, mapRef]);

    // Map click handler — only active during trail capture mode
    const onMapClick = useCallback((e) => {
        if (!captureMode) return;
        const { lng, lat } = e.lngLat;
        setCapturedPoints(prev => [...prev, [Number(lng.toFixed(7)), Number(lat.toFixed(7))]]);
    }, [captureMode, setCapturedPoints]);

    // GeoJSON builders
    const trailGeoJSON = useMemo(() => ({
        type: 'FeatureCollection',
        features: selectedTrailCoords ? [{
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: selectedTrailCoords },
            properties: {}
        }] : []
    }), [selectedTrailCoords]);

    const routeGeoJSON = useCallback((routeCoords) => {
        if (!routeCoords) return null;
        return {
            type: 'FeatureCollection',
            features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: routeCoords }, properties: {} }]
        };
    }, []);

    const capturedGeoJSON = useCallback((capturedPoints) => ({
        type: 'FeatureCollection',
        features: [
            { type: 'Feature', geometry: { type: 'LineString', coordinates: capturedPoints }, properties: { id: 'captured-line' } },
            ...capturedPoints.map((pt, i) => ({
                type: 'Feature', geometry: { type: 'Point', coordinates: pt }, properties: { id: `node-${i}` }
            }))
        ]
    }), []);

    return {
        selectedTrailName, selectedTrailCoords,
        setTrailInUrl, onMapClick,
        trailGeoJSON, routeGeoJSON, capturedGeoJSON,
        trailPaths,
    };
}