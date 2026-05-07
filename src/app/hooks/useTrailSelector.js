'use client';
// Manages the active trail from the URL, merges S3 and local trail data, and builds GeoJSON for the map.
import { useMemo, useEffect, useCallback, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import trailPaths from '../data/trailPaths';

export function useTrailSelector({ captureMode, setCapturedPoints, mapRef }) {
    const router       = useRouter();
    const pathname     = usePathname();
    const searchParams = useSearchParams();

    const [s3Trails,    setS3Trails]    = useState([]);
    const [readyToShow, setReadyToShow] = useState(false);

    // fetch trails from S3 on mount
    useEffect(() => {
        fetch('/api/trails', { cache: 'no-store' })
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setS3Trails(data); })
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (s3Trails.length > 0) { setReadyToShow(true); return; }
        const t = setTimeout(() => setReadyToShow(true), 800);
        return () => clearTimeout(t);
    }, [s3Trails]);

    // merge hardcoded trailPaths with any S3-saved trails
    const allTrailCoords = useMemo(() => {
        const map = {};
        Object.entries(trailPaths).forEach(([key, coords]) => { map[key] = coords; });
        s3Trails.forEach(t => {
            if (t.id && Array.isArray(t.points) && t.points.length > 0) map[t.id] = t.points;
        });
        return map;
    }, [s3Trails]);

    const selectedTrailName = searchParams.get('trail');

    const selectedTrailCoords = useMemo(() => {
        if (!selectedTrailName) return null;
        const coords = allTrailCoords[selectedTrailName];
        return Array.isArray(coords) && coords.length > 0 ? coords : null;
    }, [selectedTrailName, allTrailCoords]);

    const setTrailInUrl = useCallback((trailKey) => {
        const params = new URLSearchParams(searchParams);
        if (trailKey && trailKey !== selectedTrailName) params.set('trail', trailKey);
        else params.delete('trail');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, selectedTrailName, pathname, router]);

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

    // capture map clicks as trail points when the designer is recording
    const onMapClick = useCallback((e) => {
        if (!captureMode) return;
        const { lng, lat } = e.lngLat;
        setCapturedPoints(prev => [...prev, [Number(lng.toFixed(7)), Number(lat.toFixed(7))]]);
    }, [captureMode, setCapturedPoints]);

    const trailGeoJSON = useMemo(() => ({
        type: 'FeatureCollection',
        features: readyToShow && selectedTrailCoords ? [{
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: selectedTrailCoords },
            properties: {},
        }] : [],
    }), [selectedTrailCoords, readyToShow]);

    const routeGeoJSON = useCallback((routeCoords) => {
        if (!routeCoords) return null;
        return {
            type: 'FeatureCollection',
            features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: routeCoords }, properties: {} }],
        };
    }, []);

    const capturedGeoJSON = useCallback((capturedPoints) => ({
        type: 'FeatureCollection',
        features: [
            { type: 'Feature', geometry: { type: 'LineString', coordinates: capturedPoints }, properties: { id: 'captured-line' } },
            ...capturedPoints.map((pt, i) => ({
                type: 'Feature', geometry: { type: 'Point', coordinates: pt }, properties: { id: `node-${i}` },
            })),
        ],
    }), []);

    return {
        selectedTrailName, selectedTrailCoords,
        setTrailInUrl, onMapClick,
        trailGeoJSON, routeGeoJSON, capturedGeoJSON,
        trailPaths: allTrailCoords,
    };
}
