'use client';

import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useEffect, useRef, useCallback, Suspense } from 'react';

import { locations }         from '../data/locations';
import { useGPS }            from '../hooks/useGPS';
import { useNavigation }     from '../hooks/useNavigation';
import { useTrailSelector }  from '../hooks/useTrailSelector';
import MapLayers             from './MapLayers';
import RouteHUD              from './RouteHUD';
import TrailCaptureOverlay   from './TrailCaptureOverlay';

const TEAL = '#1BA39C';

// ── Map styles ───────────────────────────────────────────────────────────────
// streets-v12 = lightweight flat 2D — loads fast, no GPU building extrusion
// standard    = full 3D style — only loaded when user taps the 3D button
const STYLE_FLAT = 'mapbox://styles/mapbox/streets-v12';
const STYLE_3D   = 'mapbox://styles/mapbox/standard';

// Campus bounding box — Mapbox will only load tiles inside this area
const CAMPUS_BOUNDS = [
    [-6.395, 53.398],
    [-6.360, 53.415],
];

function trailLabel(key) {
    return key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function MapViewInner({ viewState, onMove, onMapLoad, navTarget, isNavigating, onTrailSaved, is3D }) {
    const mapRef = useRef(null);

    const [selectedLoc, setSelectedLoc]       = useState(null);
    const [captureMode, setCaptureMode]       = useState(false);
    const [capturedPoints, setCapturedPoints] = useState([]);
    const [showCaptureUI, setShowCaptureUI]   = useState(false);
    const [styleLoaded, setStyleLoaded]       = useState(false);
    const [panelOpen, setPanelOpen]           = useState(true);

    const userLocation = useGPS();

    const { routeStep, buildingA, buildingB, routeCoords, routeStats, routeError, isChained, resetToPickA, pickBuildingA }
        = useNavigation({ isNavigating, navTarget, userLocation, mapRef });

    const { selectedTrailName, setTrailInUrl, onMapClick, trailGeoJSON, routeGeoJSON, capturedGeoJSON, trailPaths }
        = useTrailSelector({ captureMode, setCapturedPoints, mapRef });

    // Reset styleLoaded when style swaps so MapLayers re-registers on the new style
    const handleMapLoad = useCallback((e) => {
        setStyleLoaded(true);
        if (onMapLoad) onMapLoad(e.target);
    }, [onMapLoad]);

    // When is3D changes, reset styleLoaded so MapLayers waits for new style
    useEffect(() => { setStyleLoaded(false); }, [is3D]);

    // Fly to nav target
    useEffect(() => {
        if (!navTarget || !mapRef.current) return;
        const [lng, lat] = navTarget.coordinates;
        mapRef.current.flyTo({ center: [lng, lat], zoom: 17.5, duration: 1400, pitch: 45 });
    }, [navTarget]);

    const trailKeys = Object.keys(trailPaths);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', cursor: captureMode ? 'crosshair' : 'inherit' }}>

            {/* ══ TRAIL PANEL ═════════════════════════════════════════════════ */}
            <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, width: 230, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{
                    background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)',
                    borderRadius: 14, border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.1)', overflow: 'hidden',
                }}>
                    {/* Header */}
                    <div onClick={() => setPanelOpen(o => !o)} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '11px 14px', cursor: 'pointer',
                        borderBottom: panelOpen ? '1px solid #f1f5f9' : 'none',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <span style={{
                                width: 22, height: 22, borderRadius: 6,
                                background: 'linear-gradient(135deg, #1BA39C, #0e6d68)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, color: '#fff', flexShrink: 0,
                            }}>🗺</span>
                            <span style={{ fontSize: 13, fontWeight: 800, color: '#1e293b' }}>Trails</span>
                            {trailKeys.length > 0 && (
                                <span style={{ fontSize: 10, fontWeight: 700, color: TEAL, background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: 20, padding: '1px 7px' }}>
                                    {trailKeys.length}
                                </span>
                            )}
                        </div>
                        <span style={{ fontSize: 11, color: '#94a3b8', display: 'inline-block', transition: 'transform 0.2s', transform: panelOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▾</span>
                    </div>

                    {/* Trail list */}
                    {panelOpen && (
                        <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 220, overflowY: 'auto' }}>
                            {trailKeys.length === 0 ? (
                                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: '8px 0' }}>No trails yet</p>
                            ) : trailKeys.map(key => {
                                const active = selectedTrailName === key;
                                return (
                                    <button key={key} onClick={() => setTrailInUrl(key)} style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        width: '100%', padding: '8px 10px', borderRadius: 9,
                                        border: 'none', outline: active ? 'none' : '1px solid #e2e8f0',
                                        background: active ? 'linear-gradient(135deg, #1BA39C, #15857f)' : '#f8fafc',
                                        color: active ? '#fff' : '#334155',
                                        cursor: 'pointer', fontWeight: active ? 700 : 500, fontSize: 12,
                                        textAlign: 'left', boxShadow: active ? '0 2px 8px rgba(27,163,156,0.3)' : 'none',
                                        transition: 'all 0.15s',
                                    }}>
                                        <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: active ? 'rgba(255,255,255,0.85)' : TEAL }} />
                                        {trailLabel(key)}
                                    </button>
                                );
                            })}
                            {selectedTrailName && (
                                <button onClick={() => setTrailInUrl(null)} style={{
                                    marginTop: 2, padding: '6px', borderRadius: 8,
                                    border: '1px solid #fecaca', background: '#fef2f2',
                                    color: '#dc2626', cursor: 'pointer', fontWeight: 700, fontSize: 11,
                                }}>✕ Clear selection</button>
                            )}
                        </div>
                    )}

                    {/* Designer button */}
                    <div style={{ padding: '0 10px 10px' }}>
                        <button onClick={() => setShowCaptureUI(o => !o)} style={{
                            width: '100%', padding: '9px', borderRadius: 9, border: 'none',
                            cursor: 'pointer', fontWeight: 700, fontSize: 12,
                            background: showCaptureUI ? '#f1f5f9' : 'linear-gradient(135deg, #0f172a, #1e293b)',
                            color: showCaptureUI ? '#475569' : '#fff',
                            boxShadow: showCaptureUI ? 'none' : '0 2px 8px rgba(0,0,0,0.18)',
                            transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}>
                            <span>{showCaptureUI ? '←' : '✏'}</span>
                            {showCaptureUI ? 'Close Designer' : 'Trail Designer'}
                        </button>
                    </div>
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

            {/* Route HUD */}
            {isNavigating && (
                <RouteHUD
                    routeStep={routeStep} buildingA={buildingA} buildingB={buildingB}
                    routeStats={routeStats} routeError={routeError}
                    isChained={isChained} onChangeStart={resetToPickA}
                />
            )}

            {/* ══ MAP ════════════════════════════════════════════════════════ */}
            <Map
                ref={mapRef}
                {...viewState}
                onMove={onMove}
                onClick={onMapClick}
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                mapStyle={is3D ? STYLE_3D : STYLE_FLAT}
                style={{ width: '100%', height: '100%' }}
                onLoad={handleMapLoad}

                // ── Performance constraints ──────────────────────────────────
                // Restricts tile loading to campus area only
                maxBounds={CAMPUS_BOUNDS}
                // Prevents loading unnecessary tile zoom levels
                minZoom={13}
                maxZoom={19}
                // Reduces overdraw on mobile GPUs
                antialias={false}
            >
                <NavigationControl position="top-right" />

                {styleLoaded && (
                    <MapLayers
                        trailGeoJSON={trailGeoJSON}
                        capturedGeoJSON={capturedGeoJSON(capturedPoints)}
                        routeGeoJSON={routeGeoJSON(routeCoords)}
                    />
                )}

                {locations.map(loc => {
                    const isTarget   = navTarget?.id === loc.id;
                    const isStart    = buildingA?.id === loc.id;
                    const isPickable = routeStep === 'PICK_A' && loc.id !== navTarget?.id;
                    return (
                        <Marker key={loc.id}
                            longitude={loc.coordinates?.[0] ?? loc.lng}
                            latitude={loc.coordinates?.[1] ?? loc.lat}
                            anchor="bottom"
                        >
                            <div style={{
                                fontSize: isTarget || isStart ? 32 : 24,
                                cursor: isPickable ? 'pointer' : 'default',
                                transition: 'font-size 0.2s, filter 0.2s',
                                filter: isTarget   ? 'drop-shadow(0 0 8px rgba(239,68,68,0.9))'
                                      : isStart    ? 'drop-shadow(0 0 8px rgba(34,197,94,0.9))'
                                      : isPickable ? 'drop-shadow(0 0 4px rgba(27,163,156,0.6))'
                                      : 'none',
                            }} onClick={e => {
                                e.stopPropagation();
                                if (routeStep === 'PICK_A' && loc.id !== navTarget?.id) pickBuildingA(loc);
                                else setSelectedLoc(loc);
                            }}>📍</div>
                        </Marker>
                    );
                })}

                {buildingA && (
                    <Marker longitude={buildingA.coordinates[0]} latitude={buildingA.coordinates[1]} anchor="top">
                        <div style={{ background: '#22c55e', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11, border: '2px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}>A</div>
                    </Marker>
                )}
                {buildingB && isNavigating && (
                    <Marker longitude={buildingB.coordinates[0]} latitude={buildingB.coordinates[1]} anchor="top">
                        <div style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11, border: '2px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}>B</div>
                    </Marker>
                )}

                {userLocation && (
                    <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
                        <div className="user-location-pulse" onClick={e => e.stopPropagation()} />
                    </Marker>
                )}

                {selectedLoc && (
                    <Popup
                        longitude={selectedLoc.coordinates?.[0] ?? selectedLoc.lng}
                        latitude={selectedLoc.coordinates?.[1] ?? selectedLoc.lat}
                        onClose={() => setSelectedLoc(null)} anchor="top" offset={10}
                    >
                        <div style={{ color: '#111', fontWeight: 700 }}>{selectedLoc.name}</div>
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