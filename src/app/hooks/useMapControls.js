'use client';
// Manages map view state and exposes zoom, 3D toggle, and recenter controls.
import { useState } from 'react';

const CAMPUS_CENTER = { longitude: -6.37824, latitude: 53.405292 };

export default function useMapControls({ gpsLocation }) {
    const [viewState, setViewState] = useState({
        ...CAMPUS_CENTER, zoom: 16, pitch: 0, bearing: 0,
    });

    const handleZoomIn   = () => setViewState(v => ({ ...v, zoom: Math.min(v.zoom + 1, 20) }));
    const handleZoomOut  = () => setViewState(v => ({ ...v, zoom: Math.max(v.zoom - 1, 0) }));
    const handleToggle3D = () => setViewState(p => ({ ...p, pitch: p.pitch === 0 ? 60 : 0, duration: 900 }));

    const handleRecenter = () => {
        const target = gpsLocation
            ? { longitude: gpsLocation.lng, latitude: gpsLocation.lat, zoom: 18 }
            : { ...CAMPUS_CENTER, zoom: 16 };
        setViewState(p => ({ ...p, ...target, pitch: 0, duration: 1200 }));
    };

    return { viewState, setViewState, handleZoomIn, handleZoomOut, handleToggle3D, handleRecenter };
}
