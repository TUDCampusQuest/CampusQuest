'use client';
// Watches the device GPS and returns the current position, or null until the first fix.
import { useState, useEffect } from 'react';

export function useGPS() {
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) return;

        const onPos = (pos) => {
            try {
                if (pos?.coords) {
                    setUserLocation({ lng: pos.coords.longitude, lat: pos.coords.latitude });
                }
            } catch {}
        };
        const onErr = () => {};

        try {
            navigator.geolocation.getCurrentPosition(onPos, onErr, {
                enableHighAccuracy: true, timeout: 10000,
            });
        } catch {}

        let id = null;
        try {
            id = navigator.geolocation.watchPosition(onPos, onErr, {
                enableHighAccuracy: true, maximumAge: 0, timeout: 10000,
            });
        } catch {}

        return () => {
            if (id != null) {
                try { navigator.geolocation.clearWatch(id); } catch {}
            }
        };
    }, []);

    return userLocation;
}
