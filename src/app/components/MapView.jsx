'use client';

import Map, { Marker, Popup, NavigationControl, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useMemo, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

import { locations } from '../data/locations';
import trailPaths from '../data/trailPaths';
import TrailCaptureOverlay from './TrailCaptureOverlay';
import { getRouteCoords, getChainedRoute, snapToNearestBuilding } from '../data/buildingRoutes';

// ─── Route states ────────────────────────────────────────────────────────────
// IDLE    → not navigating
// PICK_A  → waiting for user to tap a building pin as start point
// ACTIVE  → route drawn on map
// ERROR   → no route found between the two buildings
// ─────────────────────────────────────────────────────────────────────────────

// Haversine distance in metres between two [lng, lat] points
function haversineMetres(a, b) {
    const R = 6371000;
    const toRad = d => d * Math.PI / 180;
    const dLat = toRad(b[1] - a[1]);
    const dLng = toRad(b[0] - a[0]);
    const s = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

// Sum path length and estimate walking time at ~80 m/min on campus paths
function walkingStats(coords) {
    let dist = 0;
    for (let i = 1; i < coords.length; i++) dist += haversineMetres(coords[i - 1], coords[i]);
    return { metres: Math.round(dist), minutes: Math.ceil(dist / 80) };
}

const ALL_IDS = ['CAFE', 'AG-BLOCK', 'A-BLOCK', 'C-BLOCK', 'D-BLOCK',
                 'E-BLOCK', 'F-BLOCK', 'S-BLOCK', 'CONNECT', 'PARKING'];

function MapViewInner({ viewState, onMove, onMapLoad, navTarget, isNavigating, onTrailSaved }) {
    const mapRef      = useRef(null);
    const router      = useRouter();
    const pathname    = usePathname();
    const searchParams = useSearchParams();

    const [selectedLoc, setSelectedLoc]       = useState(null);
    const [captureMode, setCaptureMode]       = useState(false);
    const [capturedPoints, setCapturedPoints] = useState([]);
    const [showCaptureUI, setShowCaptureUI]   = useState(false);
    const [userLocation, setUserLocation]     = useState(null);
    const [styleLoaded, setStyleLoaded]       = useState(false);

    // ── Navigation / route state ─────────────────────────────────────────────
    const [routeStep, setRouteStep]     = useState('IDLE');
    const [buildingA, setBuildingA]     = useState(null);   // location object
    const [buildingB, setBuildingB]     = useState(null);   // location object (navTarget)
    const [routeCoords, setRouteCoords] = useState(null);   // [[lng,lat], ...]
    const [routeStats, setRouteStats]   = useState(null);   // { metres, minutes }
    const [routeError, setRouteError]   = useState(null);
    const [isChained, setIsChained]     = useState(false);  // true if route was stitched

    // ── Trail selector ───────────────────────────────────────────────────────
    const selectedTrailName = searchParams.get('trail');
    const selectedTrailCoords = useMemo(() => {
        const coords = selectedTrailName ? trailPaths[selectedTrailName] : null;
        return Array.isArray(coords) && coords.length > 0 ? coords : null;
    }, [selectedTrailName]);

    const setTrailInUrl = (trailKey) => {
        const params = new URLSearchParams(searchParams);
        if (trailKey && trailKey !== selectedTrailName) params.set('trail', trailKey);
        else params.delete('trail');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // ── Live GPS watcher ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!navigator.geolocation) return;
        const id = navigator.geolocation.watchPosition(
            pos => setUserLocation({ lng: pos.coords.longitude, lat: pos.coords.latitude }),
            err => console.warn('Geolocation error:', err.message),
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
        return () => navigator.geolocation.clearWatch(id);
    }, []);

    // ── When Navigate is pressed: set building B, snap A from GPS, go to PICK_A ─
    useEffect(() => {
        if (isNavigating && navTarget) {
            setBuildingB(navTarget);
            setRouteCoords(null);
            setRouteStats(null);
            setRouteError(null);
            setIsChained(false);

            // Auto-snap Point A from GPS if we have a fix
            if (userLocation) {
                const nearest = snapToNearestBuilding(
                    [userLocation.lng, userLocation.lat], locations
                );
                // Don't auto-set if GPS puts user AT the destination
                if (nearest && nearest.id !== navTarget.id) {
                    setBuildingA(nearest);
                    setRouteStep('ACTIVE'); // will trigger route resolve below
                    return;
                }
            }
            // No GPS or GPS is at destination — ask user to tap a start building
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
    }, [isNavigating, navTarget]); // intentionally excludes userLocation to avoid re-runs

    // ── Resolve route whenever both buildings are known ───────────────────────
    useEffect(() => {
        if (!buildingA || !buildingB || routeStep !== 'ACTIVE') return;

        setRouteError(null);
        setIsChained(false);

        // 1. Same building — no route needed
        if (buildingA.id === buildingB.id) {
            setRouteError("You're already at this building.");
            setRouteStep('ERROR');
            return;
        }

        // 2. Try direct route
        const direct = getRouteCoords(buildingA.id, buildingB.id);
        if (direct) {
            setRouteCoords(direct);
            setRouteStats(walkingStats(direct));
            fitRouteOnMap(direct);
            return;
        }

        // 3. Try chained route via an intermediate building
        const chained = getChainedRoute(buildingA.id, buildingB.id, ALL_IDS);
        if (chained) {
            setRouteCoords(chained);
            setRouteStats(walkingStats(chained));
            setIsChained(true);
            fitRouteOnMap(chained);
            return;
        }

        // 4. All fallbacks exhausted
        setRouteError(`No campus path found from "${buildingA.name}" to "${buildingB.name}".`);
        setRouteStep('ERROR');
    }, [buildingA, buildingB, routeStep]);

    function fitRouteOnMap(coords) {
        if (!mapRef.current || !coords?.length) return;
        const lngs = coords.map(c => c[0]);
        const lats = coords.map(c => c[1]);
        mapRef.current.fitBounds(
            [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
            { padding: 90, duration: 1000 }
        );
    }

    // ── Fly to navTarget when it's first selected ────────────────────────────
    useEffect(() => {
        if (!navTarget || !mapRef.current) return;
        const [lng, lat] = navTarget.coordinates;
        mapRef.current.flyTo({ center: [lng, lat], zoom: 17.5, duration: 1400, pitch: 45 });
    }, [navTarget]);

    // ── GeoJSON for the route line ────────────────────────────────────────────
    const routeGeoJSON = useMemo(() => {
        if (!routeCoords) return null;
        return {
            type: 'FeatureCollection',
            features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: routeCoords }, properties: {} }]
        };
    }, [routeCoords]);

    const trailGeoJSON = useMemo(() => ({
        type: 'FeatureCollection',
        features: selectedTrailCoords ? [{
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: selectedTrailCoords },
            properties: {}
        }] : []
    }), [selectedTrailCoords]);

    const capturedGeoJSON = useMemo(() => ({
        type: 'FeatureCollection',
        features: [
            { type: 'Feature', geometry: { type: 'LineString', coordinates: capturedPoints }, properties: { id: 'captured-line' } },
            ...capturedPoints.map((pt, i) => ({
                type: 'Feature', geometry: { type: 'Point', coordinates: pt }, properties: { id: `node-${i}` }
            }))
        ]
    }), [capturedPoints]);

    // ── Map click — only for trail designer ──────────────────────────────────
    const onMapClick = useCallback((e) => {
        if (!captureMode) return;
        const { lng, lat } = e.lngLat;
        setCapturedPoints(prev => [...prev, [Number(lng.toFixed(7)), Number(lat.toFixed(7))]]);
    }, [captureMode]);

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
        } catch (err) { console.error('Bounds calculation failed:', err); }
    }, [selectedTrailCoords]);

    // ── HUD instruction text ──────────────────────────────────────────────────
    const hudText = {
        PICK_A: '📍 Tap your START building on the map',
        ACTIVE: routeStats
            ? `🚶 ${routeStats.minutes} min · ${routeStats.metres} m${isChained ? ' (via connecting path)' : ''}`
            : 'Route ready',
        ERROR: routeError ?? 'No route available',
    }[routeStep] ?? '';

    const cursor = captureMode ? 'crosshair' : 'inherit';

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', cursor }}>

            {/* Trail selector sidebar */}
            <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, width: 290, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ background: 'white', padding: 15, borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', border: '1px solid #ddd' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: 16, color: '#111' }}>Trails</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 15 }}>
                        {Object.keys(trailPaths).map(key => (
                            <button key={key} onClick={() => setTrailInUrl(key)} style={{
                                padding: '5px 12px', borderRadius: 20, border: '1px solid #ccc',
                                backgroundColor: selectedTrailName === key ? '#1BA39C' : '#fff',
                                color: selectedTrailName === key ? '#fff' : '#333',
                                cursor: 'pointer', fontWeight: 600, fontSize: 12,
                            }}>{key}</button>
                        ))}
                        {selectedTrailName && (
                            <button onClick={() => setTrailInUrl(null)} style={{ cursor: 'pointer', border: 'none', background: 'none', fontSize: 12, color: '#d93025', fontWeight: 600, padding: '5px 8px' }}>
                                Clear
                            </button>
                        )}
                    </div>
                    <button onClick={() => setShowCaptureUI(!showCaptureUI)} style={{ width: '100%', padding: '10px', borderRadius: 8, cursor: 'pointer', background: '#111', color: '#fff', border: 'none', fontWeight: 700 }}>
                        {showCaptureUI ? 'Close Editor' : 'Open Trail Designer'}
                    </button>
                </div>
                {showCaptureUI && (
                    <TrailCaptureOverlay
                        captureMode={captureMode} setCaptureMode={setCaptureMode}
                        capturedPoints={capturedPoints} setCapturedPoints={setCapturedPoints}
                        onClose={() => setShowCaptureUI(false)}
                        onTrailSaved={onTrailSaved}
                    />
                )}
            </div>

            {/* ── Route HUD pill ── */}
            {isNavigating && routeStep !== 'IDLE' && (
                <div style={{
                    position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    pointerEvents: 'none', width: '90%', maxWidth: 440,
                }}>
                    {/* Main pill */}
                    <div style={{
                        background: routeStep === 'ERROR' ? '#fef2f2' : '#0f172a',
                        color: routeStep === 'ERROR' ? '#dc2626' : '#f1f5f9',
                        borderRadius: 99, padding: '10px 22px', fontSize: 13, fontWeight: 700,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                        textAlign: 'center', pointerEvents: 'auto',
                    }}>
                        {hudText}
                    </div>

                    {/* Building A/B labels when route is active */}
                    {routeStep === 'ACTIVE' && buildingA && buildingB && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: 'rgba(255,255,255,0.97)', borderRadius: 12,
                            padding: '8px 16px', boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
                            fontSize: 12, fontWeight: 700, color: '#0f172a',
                            pointerEvents: 'auto',
                        }}>
                            <span style={{ background: '#22c55e', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, flexShrink: 0 }}>A</span>
                            <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{buildingA.name}</span>
                            <span style={{ color: '#94a3b8' }}>→</span>
                            <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, flexShrink: 0 }}>B</span>
                            <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{buildingB.name}</span>
                        </div>
                    )}

                    {/* Reset / change buttons */}
                    {(routeStep === 'ACTIVE' || routeStep === 'ERROR') && (
                        <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>
                            <button
                                onClick={() => { setBuildingA(null); setRouteCoords(null); setRouteStats(null); setRouteError(null); setRouteStep('PICK_A'); }}
                                style={{ padding: '7px 16px', borderRadius: 99, border: 'none', background: '#fff', color: '#0f172a', fontWeight: 700, fontSize: 12, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                            >↺ Change Start</button>
                        </div>
                    )}
                </div>
            )}

            <Map
                ref={mapRef}
                {...viewState}
                onMove={onMove}
                onClick={onMapClick}
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                mapStyle="mapbox://styles/mapbox/standard"
                style={{ width: '100%', height: '100%' }}
                onLoad={e => { setStyleLoaded(true); if (onMapLoad) onMapLoad(e.target); }}
            >
                <NavigationControl position="top-right" />

                {styleLoaded && (
                    <>
                        <Source id="selected-trail-source" type="geojson" data={trailGeoJSON}>
                            <Layer id="trail-line" type="line" slot="middle"
                                layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                                paint={{ 'line-color': '#1BA39C', 'line-width': 6 }} />
                        </Source>

                        <Source id="capture-source" type="geojson" data={capturedGeoJSON}>
                            <Layer id="capture-line" type="line" paint={{ 'line-color': '#FF7A00', 'line-width': 3, 'line-dasharray': [2, 1] }} />
                            <Layer id="capture-pts" type="circle" paint={{ 'circle-radius': 5, 'circle-color': '#FF7A00', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' }} />
                        </Source>

                        {/* Walking route — white casing + teal fill */}
                        {routeGeoJSON && (
                            <Source id="route-source" type="geojson" data={routeGeoJSON}>
                                <Layer id="route-casing" type="line" slot="middle"
                                    layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                                    paint={{ 'line-color': '#ffffff', 'line-width': 10 }} />
                                <Layer id="route-fill" type="line" slot="middle"
                                    layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                                    paint={{ 'line-color': '#1BA39C', 'line-width': 5 }} />
                            </Source>
                        )}
                    </>
                )}

                {/* Building pins — tappable as Point A when in PICK_A mode */}
                {locations.map(loc => {
                    const isTarget  = navTarget?.id === loc.id;
                    const isStart   = buildingA?.id === loc.id;
                    const isPickable = routeStep === 'PICK_A' && loc.id !== navTarget?.id;

                    return (
                        <Marker key={loc.id}
                            longitude={loc.coordinates?.[0] ?? loc.lng}
                            latitude={loc.coordinates?.[1] ?? loc.lat}
                            anchor="bottom"
                        >
                            <div
                                style={{
                                    fontSize: isTarget || isStart ? 32 : 24,
                                    cursor: isPickable ? 'pointer' : 'default',
                                    transition: 'font-size 0.2s, filter 0.2s',
                                    filter: isTarget
                                        ? 'drop-shadow(0 0 8px rgba(239,68,68,0.9))'
                                        : isStart
                                            ? 'drop-shadow(0 0 8px rgba(34,197,94,0.9))'
                                            : isPickable
                                                ? 'drop-shadow(0 0 4px rgba(27,163,156,0.6))'
                                                : 'none',
                                }}
                                onClick={e => {
                                    e.stopPropagation();
                                    if (routeStep === 'PICK_A' && loc.id !== navTarget?.id) {
                                        // User tapped a building as their start point
                                        setBuildingA(loc);
                                        setRouteStep('ACTIVE');
                                    } else {
                                        setSelectedLoc(loc);
                                    }
                                }}
                            >
                                📍
                            </div>
                        </Marker>
                    );
                })}

                {/* Point A badge on the start building */}
                {buildingA && (
                    <Marker longitude={buildingA.coordinates[0]} latitude={buildingA.coordinates[1]} anchor="top">
                        <div style={{ background: '#22c55e', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11, border: '2px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}>A</div>
                    </Marker>
                )}

                {/* Point B badge on the destination building */}
                {buildingB && isNavigating && (
                    <Marker longitude={buildingB.coordinates[0]} latitude={buildingB.coordinates[1]} anchor="top">
                        <div style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11, border: '2px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}>B</div>
                    </Marker>
                )}

                {/* Live location blue dot */}
                {userLocation && (
                    <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
                        <div className="user-location-pulse" onClick={e => e.stopPropagation()} />
                    </Marker>
                )}

                {selectedLoc && (
                    <Popup longitude={selectedLoc.coordinates?.[0] ?? selectedLoc.lng} latitude={selectedLoc.coordinates?.[1] ?? selectedLoc.lat} onClose={() => setSelectedLoc(null)} anchor="top" offset={10}>
                        <div style={{ color: '#111' }}><strong>{selectedLoc.name}</strong></div>
                    </Popup>
                )}
            </Map>
        </div>
    );
}

export default function MapView(props) {
    return (
        <Suspense fallback={<div style={{ width: '100%', height: '100%', background: '#f1f5f9' }} />}>
            <MapViewInner {...props} />
        </Suspense>
    );
}