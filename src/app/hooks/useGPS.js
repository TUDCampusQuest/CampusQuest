'use client';
import { useState, useEffect } from 'react';

/**
 * useGPS
 * Watches the device's GPS position and returns the current location.
 * Returns null until the first fix is obtained.
 *
 * @returns {{ lng: number, lat: number } | null}
 */
export function useGPS() {
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        if (!navigator.geolocation) return;

        // getCurrentPosition first — triggers the permission prompt on mobile
        // browsers where watchPosition alone does not show the dialog.
        navigator.geolocation.getCurrentPosition(
            pos => setUserLocation({
                lng: pos.coords.longitude,
                lat: pos.coords.latitude,
            }),
            () => {},
            { enableHighAccuracy: true, timeout: 10000 }
        );

        const id = navigator.geolocation.watchPosition(
            pos => setUserLocation({
                lng: pos.coords.longitude,
                lat: pos.coords.latitude,
            }),
            () => {},
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );

        return () => navigator.geolocation.clearWatch(id);
    }, []);

    return userLocation;
}