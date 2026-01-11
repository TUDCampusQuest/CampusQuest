'use client';

import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import locations from '../data/locations';

const GOOGLE_MAPS_SRC = (key) =>
    `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
        key
    )}&loading=async`;

function loadGoogleMapsScript(apiKey) {
    return new Promise((resolve, reject) => {
        // Already loaded
        if (window.google?.maps) return resolve();

        // If script tag already exists, wait for it
        const existing = document.querySelector('script[data-google-maps="true"]');
        if (existing) {
            existing.addEventListener('load', () => resolve());
            existing.addEventListener('error', () =>
                reject(new Error('Google Maps script failed to load'))
            );
            return;
        }

        const script = document.createElement('script');
        script.src = GOOGLE_MAPS_SRC(apiKey);
        script.async = true;
        script.defer = true;
        script.dataset.googleMaps = 'true';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Google Maps script failed to load'));

        document.head.appendChild(script);
    });
}

export default function MapView({ onSelectLocation }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);

    useEffect(() => {
        let cancelled = false;

        async function init() {
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

            if (!apiKey) {
                console.error(
                    'Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY. Check .env.local and restart `npm run dev`.'
                );
                return;
            }

            try {
                await loadGoogleMapsScript(apiKey);
                if (cancelled || !mapRef.current) return;

                // Create the map once
                if (!mapInstanceRef.current) {
                    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
                        center: { lat: 53.405292, lng: -6.378240 }, // center of campus
                        zoom: 16,
                        mapTypeControl: false,
                        fullscreenControl: false,
                    });
                }

                const map = mapInstanceRef.current;

                // Clear old markers (if any) before adding
                markersRef.current.forEach((m) => m.setMap(null));
                markersRef.current = [];

                locations.forEach((location) => {
                    const marker = new window.google.maps.Marker({
                        position: { lat: location.lat, lng: location.lng },
                        map,
                        title: location.name,
                    });

                    marker.addListener('click', () => onSelectLocation?.(location));
                    markersRef.current.push(marker);
                });
            } catch (err) {
                console.error(err);

                // If you still see net::ERR_BLOCKED_BY_CLIENT, it's usually an ad blocker.
            }
        }

        init();

        return () => {
            cancelled = true;
        };
    }, [onSelectLocation]);

    return (
        <Box
            ref={mapRef}
            sx={{
                position: 'absolute',
                inset: 0,       // top:0 right:0 bottom:0 left:0
                width: '100%',
                height: '100%',
            }}
        />
    );
}