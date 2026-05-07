'use client';
// Main map component — renders the Mapbox map, building markers, indoor overlays, navigation, and handles all map tap/click events.
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';

import { useGPS } from '../hooks/useGPS';
import { useNavigation } from '../hooks/useNavigation';
import { useTrailSelector } from '../hooks/useTrailSelector';
import { useBuildingMarkers } from '../hooks/useBuildingMarkers';
import MapLayers from './MapLayers';
import NavInstructions from './NavInstructions';
import TrailCaptureOverlay from './TrailCaptureOverlay';
import TrailsPanel from './TrailsPanel';
import IndoorOverlay from './IndoorOverlay';
import { useTheme } from '../context/ThemeContext';

const STYLE_LIGHT = process.env.NEXT_PUBLIC_MAPBOX_STYLE || 'mapbox://styles/mapbox/light-v11';
const STYLE_DARK = 'mapbox://styles/mapbox/dark-v11';
const STYLE_3D = 'mapbox://styles/mapbox/standard';

const CAMPUS_BOUNDS = [[-6.395, 53.398], [-6.360, 53.415]];

function MapViewInner({
    viewState, onMove, onMapLoad,
    navTarget, navStart, isNavigating, onTrailSaved,
    is3D, isAdmin = false, onLocationSelect, onSwapDestination,
    activeBuilding, activeFloorName,
    rooms, highlightedRoomId, campusGraph,
    activeRoute, currentStepIndex,
    roomNameMap,
    activeTrail, onCloseTrail,
    onRoomSelect, onRoomNavigate, onMapTap,
    pickMode, onPickPoint,
}) {
    const mapRef = useRef(null);
    const { isDark } = useTheme();
    const flatStyle = isDark ? STYLE_DARK : STYLE_LIGHT;

    const [selectedLoc, setSelectedLoc] = useState(null);
    const [captureMode, setCaptureMode] = useState(false);
    const [capturedPoints, setCapturedPoints] = useState([]);
    const [showCaptureUI, setShowCaptureUI] = useState(false);
    const [styleLoaded, setStyleLoaded] = useState(false);
    const [prevIs3D, setPrevIs3D] = useState(is3D);

    if (prevIs3D !== is3D) {
        setPrevIs3D(is3D);
        setStyleLoaded(false);
    }

    const userLocation = useGPS();
    const lastUserLocationRef = useRef(null);
    if (userLocation) lastUserLocationRef.current = userLocation;
    const displayLocation = userLocation ?? lastUserLocationRef.current;

    const {
        routeStep, buildingA, buildingB,
        routeCoords, routeStats, routeError,
        resetToPickA, pickBuildingA,
    } = useNavigation({ isNavigating, navTarget, navStart, userLocation, mapRef, campusGraph, isIndoorActive: !!activeRoute });

    const {
        selectedTrailName, setTrailInUrl,
        onMapClick, trailGeoJSON, routeGeoJSON, capturedGeoJSON, trailPaths,
    } = useTrailSelector({ captureMode, setCapturedPoints, mapRef });

    const pickModeRef = useRef(pickMode);
    const onPickPointRef = useRef(onPickPoint);
    pickModeRef.current = pickMode;
    onPickPointRef.current = onPickPoint;

    // routes location taps to pick-mode, route-start selection, or the normal select handler
    const handleLocationSelect = useCallback((loc) => {
        if (pickModeRef.current) {
            onPickPointRef.current?.({ type: 'location', loc });
            return;
        }
        if (routeStep === 'PICK_A') {
            pickBuildingA(loc);
            return;
        }
        if (isNavigating && onSwapDestination && loc?.id && loc.id !== navTarget?.id) {
            onSwapDestination(loc);
            return;
        }
        onLocationSelect?.(loc);
    }, [routeStep, pickBuildingA, onLocationSelect, isNavigating, onSwapDestination, navTarget]);

    useBuildingMarkers({ map: mapRef.current?.getMap?.(), styleLoaded, onLocationSelect: handleLocationSelect, buildingA, buildingB });

    // marks the style as loaded so layers can be added
    const handleMapLoad = useCallback((e) => {
        setStyleLoaded(true);
        if (onMapLoad) onMapLoad(e.target);
    }, [onMapLoad]);

    useEffect(() => {
        if (!isAdmin) { setShowCaptureUI(false); setCaptureMode(false); }
    }, [isAdmin]);

    const lastClickTimeRef    = useRef(0);
    const lastClickFeatureRef = useRef(null);

    // handles map taps — single tap selects a room, double tap navigates to it
    const handleClick = useCallback((e) => {
        onMapClick(e);

        const map = mapRef.current?.getMap ? mapRef.current.getMap() : mapRef.current;
        if (!map) { onMapTap?.(); return; }

        const features = map.queryRenderedFeatures(e.point, { layers: ['indoor-rooms-fill'] });

        if (pickModeRef.current) {
            if (features?.length > 0) {
                const roomFeature = rooms?.features?.find(f => f.properties.poiId === features[0].properties.poiId);
                if (roomFeature) { onPickPointRef.current?.({ type: 'room', feature: roomFeature }); return; }
            }
            return;
        }

        const now = Date.now();
        const delta = now - lastClickTimeRef.current;
        const clickedFeatureId = features?.[0]?.properties?.poiId ?? null;

        if (features?.length > 0 && delta < 600 && lastClickFeatureRef.current === clickedFeatureId) {
            const roomFeature = rooms?.features?.find(f => f.properties.poiId === features[0].properties.poiId);
            if (roomFeature && onRoomNavigate) onRoomNavigate(roomFeature);
            lastClickTimeRef.current = 0;
            lastClickFeatureRef.current = null;
        } else if (features?.length > 0) {
            const roomFeature = rooms?.features?.find(f => f.properties.poiId === features[0].properties.poiId);
            if (roomFeature && onRoomSelect) onRoomSelect(roomFeature);
            lastClickTimeRef.current = now;
            lastClickFeatureRef.current = clickedFeatureId;
        } else {
            lastClickTimeRef.current = 0;
            lastClickFeatureRef.current = null;
            onMapTap?.(e.lngLat);
        }
    }, [onMapClick, onRoomSelect, onRoomNavigate, onMapTap, rooms]);

    useEffect(() => {
        if (!navTarget || !mapRef.current) return;
        const [lng, lat] = navTarget.coordinates;
        try {
            mapRef.current.flyTo({ center: [lng, lat], zoom: 17.5, duration: 1400, pitch: 45 });
        } catch (err) {
            console.warn('flyTo to navTarget suppressed:', err?.message || err);
        }
    }, [navTarget]);

    const activeCursor = (captureMode || pickMode) ? 'crosshair' : 'inherit';

    // GeoJSON for the active trail line drawn on the map
    const trailPathGeoJSON = useMemo(() => {
        if (!activeTrail?.computedPath?.length) return null;
        return {
            type: 'FeatureCollection',
            features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: activeTrail.computedPath }, properties: {} }],
        };
    }, [activeTrail?.computedPath]);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', cursor: activeCursor }}>
            {activeTrail && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
                    background: 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border-color)',
                    padding: '8px 16px',
                    display: 'flex', alignItems: 'center', gap: 10,
                }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                            {activeTrail.name}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 10 }}>
                            {activeTrail.computedDistance ?? activeTrail.distance ?? ''}m
                            {activeTrail.stops?.length ? ` · ${activeTrail.stops.length} stops` : ''}
                        </span>
                    </div>
                    <button
                        onClick={onCloseTrail}
                        style={{
                            background: 'transparent', border: 'none',
                            color: 'var(--text-secondary)', fontSize: 18,
                            cursor: 'pointer', padding: '2px 4px', lineHeight: 1,
                        }}
                        aria-label="Close trail"
                    >✕</button>
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
                    roomNameMap={roomNameMap}
                    mapRef={mapRef}
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
                {styleLoaded && (
                    <>
                        <MapLayers
                            trailGeoJSON={trailGeoJSON}
                            capturedGeoJSON={capturedGeoJSON(capturedPoints)}
                            routeGeoJSON={activeRoute ? null : routeGeoJSON(routeCoords)}
                            activeTrailGeoJSON={trailPathGeoJSON}
                        />

                        {activeTrail?.stops?.map((stop, idx) => (
                            <Marker key={stop.id} longitude={stop.lng} latitude={stop.lat} anchor="center">
                                <div style={{
                                    width: 28, height: 28, borderRadius: '50%',
                                    background: '#7C3AED', color: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: 12,
                                    border: '2px solid #fff',
                                    boxShadow: '0 2px 8px rgba(124,58,237,0.6)',
                                    pointerEvents: 'none',
                                }}>
                                    {idx + 1}
                                </div>
                            </Marker>
                        ))}

                        {displayLocation?.lng != null && displayLocation?.lat != null && (
                            <Marker longitude={displayLocation.lng} latitude={displayLocation.lat} anchor="center">
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
