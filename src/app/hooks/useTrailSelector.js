'use client';
import { useMemo, useEffect, useCallback, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import trailPaths from '../data/trailPaths';

/**
 * useTrailSelector
 * Manages the active trail from the URL ?trail= param.
 *
 * FIX: Now fetches trails from S3 via /api/trails and merges them with the
 * local trailPaths.js so that trails saved via the Trail Designer are
 * recognised when navigating to /?trail=<id> from the /trails page.
 *
 * Lookup priority: S3 trails first, then local trailPaths fallback.
 */
export function useTrailSelector({ captureMode, setCapturedPoints, mapRef }) {
    const router       = useRouter();
    const pathname     = usePathname();
    const searchParams = useSearchParams();

    // ── Fetch S3 trails once on mount ────────────────────────────────────────
    const [s3Trails, setS3Trails] = useState([]);

    useEffect(() => {
        fetch('/api/trails', { cache: 'no-store' })
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setS3Trails(data); })
            .catch(() => {});
    }, []);

    // ── Merge: build a lookup map of id → coords covering both sources ───────
    // S3 trails take priority; local trailPaths fills in anything not in S3.
    const allTrailCoords = useMemo(() => {
        const map = {};
        // Start with local static trails (keyed by name string)
        Object.entries(trailPaths).forEach(([key, coords]) => { map[key] = coords; });
        // Overlay S3 trails (keyed by id)
        s3Trails.forEach(t => {
            if (t.id && Array.isArray(t.points) && t.points.length > 0) {
                map[t.id] = t.points;
            }
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

    // Map click — only active during trail capture
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

    // Expose allTrailCoords so MapView sidebar can show ALL trails (S3 + local)
    return {
        selectedTrailName, selectedTrailCoords,
        setTrailInUrl, onMapClick,
        trailGeoJSON, routeGeoJSON, capturedGeoJSON,
        trailPaths: allTrailCoords,   // replaces the old static trailPaths export
    };
}