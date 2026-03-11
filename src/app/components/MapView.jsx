'use client';

import Map, { Marker, Popup, NavigationControl, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

import { locations } from '../data/locations';
import trailPaths from '../data/trailPaths';
import TrailCaptureOverlay from './TrailCaptureOverlay';

function MapViewInner({ viewState, onMove }) {
    const mapRef = useRef(null);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [selectedLoc, setSelectedLoc] = useState(null);
    const [captureMode, setCaptureMode] = useState(false);
    const [capturedPoints, setCapturedPoints] = useState([]);
    const [showCaptureUI, setShowCaptureUI] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    // FIX: Track whether the Mapbox style has fully loaded before rendering layers
    const [styleLoaded, setStyleLoaded] = useState(false);

    const selectedTrailName = searchParams.get('trail');
    const selectedTrailCoords = useMemo(() => {
        const coords = selectedTrailName ? trailPaths[selectedTrailName] : null;
        return Array.isArray(coords) && coords.length > 0 ? coords : null;
    }, [selectedTrailName]);

    const setTrailInUrl = (trailKey) => {
        const params = new URLSearchParams(searchParams);
        if (trailKey && trailKey !== selectedTrailName) {
            params.set('trail', trailKey);
        } else {
            params.delete('trail');
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    useEffect(() => {
        if (!navigator.geolocation) return;

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setUserLocation({
                    lng: position.coords.longitude,
                    lat: position.coords.latitude,
                });
            },
            (err) => {
                console.warn("Geolocation error:", err.message);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 10000,
            }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    const handleRecenter = () => {
        if (!userLocation || !mapRef.current) return;
        mapRef.current.flyTo({
            center: [userLocation.lng, userLocation.lat],
            zoom: 18,
            duration: 2000,
        });
    };

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
            {
                type: 'Feature',
                geometry: { type: 'LineString', coordinates: capturedPoints },
                properties: { id: 'captured-line' }
            },
            ...capturedPoints.map((point, index) => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: point },
                properties: { id: `node-${index}` }
            }))
        ]
    }), [capturedPoints]);

    const onMapClick = (e) => {
        if (!captureMode) return;
        const { lng, lat } = e.lngLat;
        setCapturedPoints((prev) => [...prev, [Number(lng.toFixed(7)), Number(lat.toFixed(7))]]);
    };

    useEffect(() => {
        if (!selectedTrailCoords || selectedTrailCoords.length === 0 || !mapRef.current) return;

        try {
            const lngs = selectedTrailCoords.map(p => p[0]);
            const lats = selectedTrailCoords.map(p => p[1]);

            if (lngs.some(isNaN) || lats.some(isNaN)) return;

            const bounds = [
                [Math.min(...lngs), Math.min(...lats)],
                [Math.max(...lngs), Math.max(...lats)]
            ];

            mapRef.current.fitBounds(bounds, { padding: 80, duration: 1000 });
        } catch (err) {
            console.error("Bounds calculation failed:", err);
        }
    }, [selectedTrailCoords]);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', cursor: captureMode ? 'crosshair' : 'inherit' }}>

            {/* Trail selector sidebar */}
            <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, width: 290, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ background: 'white', padding: 15, borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', border: '1px solid #ddd' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: 16, color: '#111' }}>Trails</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 15 }}>
                        {Object.keys(trailPaths).map((key) => (
                            <button key={key} onClick={() => setTrailInUrl(key)}
                                    style={{
                                        padding: '5px 12px', borderRadius: 20, border: '1px solid #ccc',
                                        backgroundColor: selectedTrailName === key ? '#1BA39C' : '#fff',
                                        color: selectedTrailName === key ? '#fff' : '#333',
                                        cursor: 'pointer', fontWeight: 600, fontSize: 12
                                    }}>
                                {key}
                            </button>
                        ))}
                        {selectedTrailName && (
                            <button
                                onClick={() => setTrailInUrl(null)}
                                style={{ cursor: 'pointer', border: 'none', background: 'none', fontSize: 12, color: '#d93025', fontWeight: 600, padding: '5px 8px' }}
                            >
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
                        captureMode={captureMode}
                        setCaptureMode={setCaptureMode}
                        capturedPoints={capturedPoints}
                        setCapturedPoints={setCapturedPoints}
                        onClose={() => setShowCaptureUI(false)}
                    />
                )}
            </div>

            {/* Recenter button */}
            <button
                onClick={handleRecenter}
                disabled={!userLocation}
                title={userLocation ? 'Centre on my location' : 'Waiting for location…'}
                style={{
                    position: 'absolute', bottom: 40, right: 16, zIndex: 10,
                    width: 48, height: 48, borderRadius: '50%',
                    border: '2px solid #fff',
                    background: userLocation ? '#1BA39C' : '#aaa',
                    color: '#fff',
                    cursor: userLocation ? 'pointer' : 'not-allowed',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s', padding: 0,
                }}
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <line x1="12" y1="2"  x2="12" y2="6"  />
                    <line x1="12" y1="18" x2="12" y2="22" />
                    <line x1="2"  y1="12" x2="6"  y2="12" />
                    <line x1="18" y1="12" x2="22" y2="12" />
                </svg>
            </button>

            <Map
                ref={mapRef}
                {...viewState}
                onMove={onMove}
                onClick={onMapClick}
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                mapStyle="mapbox://styles/mapbox/standard"
                style={{ width: '100%', height: '100%' }}
                // FIX: Set styleLoaded to true only after the style is fully ready.
                // This prevents the "Style is not done loading" crash.
                onLoad={() => setStyleLoaded(true)}
            >
                <NavigationControl position="top-right" />

                {/* FIX: Only render Sources/Layers once the style has loaded.
                    Also fixed 'line-cap' → moved from paint to layout where it belongs. */}
                {styleLoaded && (
                    <>
                        <Source id="selected-trail-source" type="geojson" data={trailGeoJSON}>
                            <Layer
                                id="trail-line"
                                type="line"
                                slot="middle"
                                layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                                paint={{ 'line-color': '#1BA39C', 'line-width': 6 }}
                            />
                        </Source>

                        <Source id="capture-source" type="geojson" data={capturedGeoJSON}>
                            <Layer id="capture-line" type="line" paint={{ 'line-color': '#FF7A00', 'line-width': 3, 'line-dasharray': [2, 1] }} />
                            <Layer id="capture-pts" type="circle" paint={{ 'circle-radius': 5, 'circle-color': '#FF7A00', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' }} />
                        </Source>
                    </>
                )}

                {locations.map((loc) => (
                    <Marker key={loc.id} longitude={loc.coordinates?.[0] ?? loc.lng} latitude={loc.coordinates?.[1] ?? loc.lat} anchor="bottom">
                        <div style={{ fontSize: 24, cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setSelectedLoc(loc); }}>📍</div>
                    </Marker>
                ))}

                {userLocation && (
                    <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
                        <div className="user-location-pulse" onClick={(e) => e.stopPropagation()} />
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

// Wrap in Suspense — required by Next.js App Router when useSearchParams is used
export default function MapView(props) {
    return (
        <Suspense fallback={<div style={{ width: '100%', height: '100%', background: '#f1f5f9' }} />}>
            <MapViewInner {...props} />
        </Suspense>
    );
}