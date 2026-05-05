'use client';
import { useState, useEffect } from 'react';

/**
 * useGPS
 * Watches the device's GPS position and returns the current location.
 * Returns null until the first fix is obtained. Defensive against missing
 * geolocation APIs and runtime callback errors so a GPS failure never
 * propagates up and wipes nav state.
 *
 * @returns {{ lng: number, lat: number } | null}
 */
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
            // getCurrentPosition first — triggers the permission prompt on mobile
            // browsers where watchPosition alone does not show the dialog.
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
