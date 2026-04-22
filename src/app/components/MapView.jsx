'use client';

import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useEffect, useRef, useCallback, Suspense } from 'react';

import { locations }        from '../data/locations';
import { useGPS }           from '../hooks/useGPS';
import { useNavigation }    from '../hooks/useNavigation';
import { useTrailSelector } from '../hooks/useTrailSelector';
import MapLayers            from './MapLayers';
import NavInstructions      from './NavInstructions';
import TrailCaptureOverlay  from './TrailCaptureOverlay';
import TrailsPanel          from './TrailsPanel';
import RoomStatusPanel      from './RoomStatusPanel';
import IndoorOverlay from './IndoorOverlay';
import FloorSwitcher from './FloorSwitcher';

const STYLE_FLAT = 'mapbox://styles/mapbox/streets-v12';
const STYLE_3D   = 'mapbox://styles/mapbox/standard';

const CAMPUS_BOUNDS = [
    [-6.395, 53.398],
    [-6.360, 53.415],
];

function MapViewInner({
                          viewState, onMove, onMapLoad,
                          navTarget, isNavigating, onTrailSaved,
                          is3D, isAdmin = false, onLocationSelect,
                      }) {
    const mapRef = useRef(null);

    const [selectedLoc,    setSelectedLoc]    = useState(null);
    const [captureMode,    setCaptureMode]    = useState(false);
    const [capturedPoints, setCapturedPoints] = useState([]);
    const [showCaptureUI,  setShowCaptureUI]  = useState(false);
    const [styleLoaded,    setStyleLoaded]    = useState(false);
    const [isIndoorMode,   setIsIndoorMode]   = useState(false);
    const [activeFloor,    setActiveFloor]    = useState(0);
    const [activeBuilding, setActiveBuilding] = useState('F-BLOCK');

    const userLocation = useGPS();

    const {
        routeStep, buildingA, buildingB,
        routeCoords, routeStats, routeError,
        resetToPickA, pickBuildingA,
    } = useNavigation({ isNavigating, navTarget, userLocation, mapRef });

    const {
        selectedTrailName, setTrailInUrl,
        onMapClick, trailGeoJSON, routeGeoJSON, capturedGeoJSON, trailPaths,
    } = useTrailSelector({ captureMode, setCapturedPoints, mapRef });



    const handleMapLoad = useCallback((e) => {
        setStyleLoaded(true);
        if (onMapLoad) onMapLoad(e.target);
    }, [onMapLoad]);

    useEffect(() => { setStyleLoaded(false); }, [is3D]);

    useEffect(() => {
        if (!isAdmin) { setShowCaptureUI(false); setCaptureMode(false); }
    }, [isAdmin]);

    useEffect(() => {
        if (!navTarget || !mapRef.current) return;
        const [lng, lat] = navTarget.coordinates;
        mapRef.current.flyTo({ center: [lng, lat], zoom: 17.5, duration: 1400, pitch: 45 });
    }, [navTarget]);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', cursor: captureMode ? 'crosshair' : 'inherit' }}>

            <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, width: 230, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <TrailsPanel
                    trailPaths={trailPaths}
                    selectedTrailName={selectedTrailName}
                    setTrailInUrl={setTrailInUrl}
                    isAdmin={isAdmin}
                    showCaptureUI={showCaptureUI}
                    onToggleCaptureUI={() => setShowCaptureUI(o => !o)}
                />

                {isAdmin && showCaptureUI && (
                    <TrailCaptureOverlay
                        captureMode={captureMode}
                        setCaptureMode={setCaptureMode}
                        capturedPoints={capturedPoints}
                        setCapturedPoints={setCapturedPoints}
                        onClose={() => setShowCaptureUI(false)}
                        onTrailSaved={onTrailSaved}
                    />
                )}

                {isAdmin && <RoomStatusPanel />}
            </div>

            {isNavigating && (
                <NavInstructions
                    routeStep={routeStep}
                    routeStats={routeStats}
                    routeCoords={routeCoords}
                    buildingA={buildingA}
                    buildingB={buildingB}
                    routeError={routeError}
                    onChangeStart={resetToPickA}
                />
            )}

            <Map
                ref={mapRef}
                {...viewState}
                onMove={onMove}
                onClick={onMapClick}
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                mapStyle={is3D ? STYLE_3D : STYLE_FLAT}
                style={{ width: '100%', height: '100%' }}
                onLoad={handleMapLoad}
                maxBounds={CAMPUS_BOUNDS}
                minZoom={13}
                maxZoom={19}
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
                    const isTarget   = navTarget?.id  === loc.id;
                    const isStart    = buildingA?.id  === loc.id;
                    const isPickable = routeStep === 'PICK_A' && loc.id !== navTarget?.id;

                    return (
                        <Marker
                            key={loc.id}
                            longitude={loc.coordinates?.[0] ?? loc.lng}
                            latitude={loc.coordinates?.[1]  ?? loc.lat}
                            anchor="bottom"
                        >
                            <div
                                style={{
                                    fontSize: isTarget || isStart ? 32 : 24,
                                    cursor: 'pointer',
                                    transition: 'font-size 0.2s, filter 0.2s',
                                    filter: isTarget   ? 'drop-shadow(0 0 8px rgba(239,68,68,0.9))'
                                        : isStart    ? 'drop-shadow(0 0 8px rgba(34,197,94,0.9))'
                                            : isPickable ? 'drop-shadow(0 0 4px rgba(27,163,156,0.6))'
                                                : 'none',
                                }}
                                onClick={e => {
                                    e.stopPropagation();
                                    if (routeStep === 'PICK_A' && loc.id !== navTarget?.id) {
                                        pickBuildingA(loc);
                                    } else if (onLocationSelect) {
                                        onLocationSelect(loc);
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

                {selectedLoc && !onLocationSelect && (
                    <Popup
                        longitude={selectedLoc.coordinates?.[0] ?? selectedLoc.lng}
                        latitude={selectedLoc.coordinates?.[1]  ?? selectedLoc.lat}
                        onClose={() => setSelectedLoc(null)}
                        anchor="top"
                        offset={10}
                    >
                        <div style={{ color: '#111', fontWeight: 700 }}>{selectedLoc.name}</div>
                    </Popup>
                )}

                <IndoorOverlay
                    isIndoorMode={isIndoorMode}
                    buildingId={activeBuilding}
                    activeFloor={activeFloor}
                />

                <FloorSwitcher
                    isIndoorMode={isIndoorMode}
                    setIsIndoorMode={setIsIndoorMode}
                    buildingId={activeBuilding}
                    activeFloor={activeFloor}
                    setActiveFloor={setActiveFloor}
                />
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