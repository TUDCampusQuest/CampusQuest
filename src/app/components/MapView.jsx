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
import IndoorOverlay        from './IndoorOverlay';
import { useTheme }         from '../context/ThemeContext';

const STYLE_LIGHT = process.env.NEXT_PUBLIC_MAPBOX_STYLE || 'mapbox://styles/mapbox/light-v11';
const STYLE_DARK  = 'mapbox://styles/mapbox/dark-v11';
const STYLE_3D    = 'mapbox://styles/mapbox/standard';

const CAMPUS_BOUNDS = [
    [-6.395, 53.398],
    [-6.360, 53.415],
];

function MapViewInner({
                          viewState, onMove, onMapLoad,
                          navTarget, navStart, isNavigating, onTrailSaved,
                          is3D, isAdmin = false, onLocationSelect,
                          activeBuilding, activeFloorName,
                          rooms, highlightedRoomId, campusGraph,
                          activeRoute, currentStepIndex,
                          pickingNavPoint, onNavPick,
                          roomNameMap,
                          pickingIndoorStart, onIndoorRoomPick, onIndoorChangeStart,
                      }) {
    const mapRef = useRef(null);
    const { isDark } = useTheme();
    const flatStyle = isDark ? STYLE_DARK : STYLE_LIGHT;

    const [selectedLoc,    setSelectedLoc]    = useState(null);
    const [captureMode,    setCaptureMode]    = useState(false);
    const [capturedPoints, setCapturedPoints] = useState([]);
    const [showCaptureUI,  setShowCaptureUI]  = useState(false);
    const [styleLoaded,    setStyleLoaded]    = useState(false);
    const [prevIs3D,       setPrevIs3D]       = useState(is3D);

    // Reset styleLoaded synchronously when is3D changes so no Markers render
    // during the style-transition frame (prevents appendChild errors).
    if (prevIs3D !== is3D) {
        setPrevIs3D(is3D);
        setStyleLoaded(false);
    }

    const userLocation = useGPS();

    const {
        routeStep, buildingA, buildingB,
        routeCoords, routeStats, routeError,
        resetToPickA, pickBuildingA,
    } = useNavigation({ isNavigating, navTarget, navStart, userLocation, mapRef, campusGraph });

    const {
        selectedTrailName, setTrailInUrl,
        onMapClick, trailGeoJSON, routeGeoJSON, capturedGeoJSON, trailPaths,
    } = useTrailSelector({ captureMode, setCapturedPoints, mapRef });

    const handleMapLoad = useCallback((e) => {
        setStyleLoaded(true);
        if (onMapLoad) onMapLoad(e.target);
    }, [onMapLoad]);

    // Combined click: indoor-start pick → nav-pick → trail capture
    const handleClick = useCallback((e) => {
        if (pickingIndoorStart && onIndoorRoomPick) {
            // Query the room fill layer at the click pixel
            const features = mapRef.current?.queryRenderedFeatures(e.point, {
                layers: ['indoor-rooms-fill'],
            });
            if (features?.length) {
                // Reconstruct a minimal GeoJSON feature the router expects
                const f = features[0];
                onIndoorRoomPick({ type: 'Feature', geometry: f.geometry, properties: f.properties });
            }
            return;
        }
        if (pickingNavPoint) {
            onNavPick?.(e.lngLat);
            return;
        }
        onMapClick(e);
    }, [pickingIndoorStart, onIndoorRoomPick, pickingNavPoint, onNavPick, onMapClick]);

    useEffect(() => {
        if (!isAdmin) { setShowCaptureUI(false); setCaptureMode(false); }
    }, [isAdmin]);

    useEffect(() => {
        if (!navTarget || !mapRef.current) return;
        const [lng, lat] = navTarget.coordinates;
        mapRef.current.flyTo({ center: [lng, lat], zoom: 17.5, duration: 1400, pitch: 45 });
    }, [navTarget]);

    const activeCursor = pickingNavPoint || pickingIndoorStart ? 'crosshair' : captureMode ? 'crosshair' : 'inherit';

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', cursor: activeCursor }}>

            {/* Pick-mode banner */}
            {pickingNavPoint && (
                <div style={{
                    position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 25, background: 'rgba(29,78,216,0.92)', color: '#fff',
                    fontWeight: 700, fontSize: 13, padding: '10px 20px',
                    borderRadius: 99, boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                    whiteSpace: 'nowrap', pointerEvents: 'none',
                }}>
                    📌 Tap a room or location to set as {pickingNavPoint === 'A' ? 'start' : 'destination'}
                </div>
            )}

            {/* Indoor change-start banner */}
            {pickingIndoorStart && (
                <div style={{
                    position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 25, background: 'rgba(0,180,180,0.92)', color: '#fff',
                    fontWeight: 700, fontSize: 13, padding: '10px 20px',
                    borderRadius: 99, boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                    whiteSpace: 'nowrap', pointerEvents: 'none',
                }}>
                    📌 Tap a room on the map to set as your new start
                </div>
            )}

            <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, width: 230, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {isAdmin && (
                    <TrailsPanel
                        trailPaths={trailPaths}
                        selectedTrailName={selectedTrailName}
                        setTrailInUrl={setTrailInUrl}
                        isAdmin={isAdmin}
                        showCaptureUI={showCaptureUI}
                        onToggleCaptureUI={() => setShowCaptureUI(o => !o)}
                    />
                )}

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

            {(isNavigating || activeRoute) && (
                <NavInstructions
                    routeStep={routeStep}
                    routeStats={routeStats}
                    routeCoords={routeCoords}
                    buildingA={buildingA}
                    buildingB={buildingB}
                    routeError={routeError}
                    onChangeStart={resetToPickA}
                    activeRoute={activeRoute}
                    currentStepIndex={currentStepIndex}
                    onIndoorChangeStart={onIndoorChangeStart}
                    roomNameMap={roomNameMap}
                />
            )}

            <Map
                ref={mapRef}
                {...viewState}
                onMove={onMove}
                onClick={handleClick}
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                mapStyle={is3D ? STYLE_3D : flatStyle}
                style={{ width: '100%', height: '100%' }}
                onLoad={handleMapLoad}
                maxBounds={CAMPUS_BOUNDS}
                minZoom={13}
                maxZoom={20}
                antialias={false}
            >
                <NavigationControl position="top-right" />

                {/* Guard everything behind styleLoaded to prevent appendChild errors
                    during initial mount and map style transitions */}
                {styleLoaded && (
                    <>
                        <MapLayers
                            trailGeoJSON={trailGeoJSON}
                            capturedGeoJSON={capturedGeoJSON(capturedPoints)}
                            routeGeoJSON={routeGeoJSON(routeCoords)}
                        />

                        {locations.map(loc => {
                            const lng = loc.coordinates?.[0] ?? loc.lng;
                            const lat = loc.coordinates?.[1] ?? loc.lat;
                            if (lng == null || lat == null) return null;

                            const isTarget   = navTarget?.id  === loc.id;
                            const isStart    = buildingA?.id  === loc.id;
                            const isPickable = routeStep === 'PICK_A' && loc.id !== navTarget?.id;

                            const bg = isTarget  ? 'linear-gradient(135deg,#ef4444,#dc2626)'
                                     : isStart   ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                                     : isPickable? 'linear-gradient(135deg,#1BA39C,#0e6d68)'
                                     : 'linear-gradient(135deg,#7C3AED,#5B21B6)';

                            const shadow = isTarget  ? '0 2px 10px rgba(239,68,68,0.6)'
                                         : isStart   ? '0 2px 10px rgba(34,197,94,0.6)'
                                         : isPickable? '0 2px 10px rgba(27,163,156,0.5)'
                                         : '0 2px 8px rgba(124,58,237,0.45)';

                            return (
                                <Marker key={loc.id} longitude={lng} latitude={lat} anchor="bottom">
                                    <div
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
                                        style={{
                                            width: isTarget || isStart ? 36 : 30,
                                            height: isTarget || isStart ? 36 : 30,
                                            borderRadius: '10px',
                                            background: bg,
                                            boxShadow: shadow,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: isTarget || isStart ? 18 : 15,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            border: '2px solid rgba(255,255,255,0.25)',
                                        }}
                                    >
                                        🏛️
                                    </div>
                                </Marker>
                            );
                        })}

                        {buildingA?.coordinates && (
                            <Marker longitude={buildingA.coordinates[0]} latitude={buildingA.coordinates[1]} anchor="top">
                                <div style={{ background: '#22c55e', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11, border: '2px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}>A</div>
                            </Marker>
                        )}
                        {buildingB?.coordinates && isNavigating && (
                            <Marker longitude={buildingB.coordinates[0]} latitude={buildingB.coordinates[1]} anchor="top">
                                <div style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11, border: '2px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}>B</div>
                            </Marker>
                        )}

                        {userLocation?.lng != null && userLocation?.lat != null && (
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
                            activeBuilding={activeBuilding}
                            activeFloorName={activeFloorName}
                            rooms={rooms}
                            highlightedRoomId={highlightedRoomId}
                            routePath={activeRoute?.path}
                            isCrossBuilding={activeRoute?.isCrossBuilding ?? false}
                            outdoorPathLength={activeRoute?.outdoorPathLength ?? 0}
                            pickingIndoorStart={pickingIndoorStart}
                        />
                    </>
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
