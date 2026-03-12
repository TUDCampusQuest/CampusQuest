'use client';

import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useEffect, useRef, Suspense } from 'react';

import { locations } from '../data/locations';
import { useGPS } from '../hooks/useGPS';
import { useNavigation } from '../hooks/useNavigation';
import { useTrailSelector } from '../hooks/useTrailSelector';
import MapLayers from './MapLayers';
import RouteHUD from './RouteHUD';
import TrailCaptureOverlay from './TrailCaptureOverlay';

function MapViewInner({ viewState, onMove, onMapLoad, navTarget, isNavigating, onTrailSaved }) {
    const mapRef = useRef(null);

    const [selectedLoc, setSelectedLoc]       = useState(null);
    const [captureMode, setCaptureMode]       = useState(false);
    const [capturedPoints, setCapturedPoints] = useState([]);
    const [showCaptureUI, setShowCaptureUI]   = useState(false);
    const [styleLoaded, setStyleLoaded]       = useState(false);

    const userLocation = useGPS();

    const {
        routeStep, buildingA, buildingB,
        routeCoords, routeStats, routeError, isChained,
        resetToPickA, pickBuildingA,
    } = useNavigation({ isNavigating, navTarget, userLocation, mapRef });

    const {
        selectedTrailName, setTrailInUrl, onMapClick,
        trailGeoJSON, routeGeoJSON, capturedGeoJSON, trailPaths,
    } = useTrailSelector({ captureMode, setCapturedPoints, mapRef });

    // Fly to selected location
    useEffect(() => {
        if (!navTarget || !mapRef.current) return;
        const [lng, lat] = navTarget.coordinates;
        mapRef.current.flyTo({ center: [lng, lat], zoom: 17.5, duration: 1400, pitch: 45 });
    }, [navTarget]);

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

            {/* Route HUD */}
            {isNavigating && (
                <RouteHUD
                    routeStep={routeStep}
                    buildingA={buildingA} buildingB={buildingB}
                    routeStats={routeStats} routeError={routeError}
                    isChained={isChained} onChangeStart={resetToPickA}
                />
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
                    <MapLayers
                        trailGeoJSON={trailGeoJSON}
                        capturedGeoJSON={capturedGeoJSON(capturedPoints)}
                        routeGeoJSON={routeGeoJSON(routeCoords)}
                    />
                )}

                {/* Building pins */}
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

                {/* A / B badges */}
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

                {/* Live GPS dot */}
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