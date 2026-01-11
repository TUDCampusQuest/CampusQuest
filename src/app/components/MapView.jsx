'use client';

import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import locations from '../data/locations';

const GOOGLE_MAPS_SRC = (key) =>
    `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
        key
    )}&v=weekly&loading=async`;

function loadGoogleMapsScript(apiKey) {
    return new Promise((resolve, reject) => {
        // If already available (including importLibrary)
        if (window.google?.maps?.importLibrary) return resolve();

        const existing = document.querySelector('script[data-google-maps="true"]');
        if (existing) {
            // If script exists but maps not ready yet, wait a bit
            const start = Date.now();
            const tick = () => {
                if (window.google?.maps?.importLibrary) return resolve();
                if (Date.now() - start > 5000)
                    return reject(new Error('Google Maps loaded but importLibrary is missing.'));
                requestAnimationFrame(tick);
            };
            tick();
            return;
        }

        const script = document.createElement('script');
        script.src = GOOGLE_MAPS_SRC(apiKey);
        script.async = true;
        script.defer = true;
        script.dataset.googleMaps = 'true';

        script.onload = () => {
            const start = Date.now();
            const tick = () => {
                if (window.google?.maps?.importLibrary) return resolve();
                if (Date.now() - start > 5000)
                    return reject(new Error('Google Maps loaded but importLibrary is missing.'));
                requestAnimationFrame(tick);
            };
            tick();
        };

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

                // Modern API: import libraries
                const { Map } = await window.google.maps.importLibrary('maps');
                const { Marker } = await window.google.maps.importLibrary('marker');

                // Create map once
                if (!mapInstanceRef.current) {
                    mapInstanceRef.current = new Map(mapRef.current, {
                        center: { lat: 53.405292, lng: -6.378240 },
                        zoom: 16,
                        mapTypeControl: false,
                        fullscreenControl: false,
                    });
                }

                const map = mapInstanceRef.current;

                // Clear old markers
                markersRef.current.forEach((m) => {
                    // AdvancedMarkerElement uses map = null
                    if ('map' in m) m.map = null;
                    // Classic marker uses setMap
                    if (typeof m.setMap === 'function') m.setMap(null);
                });
                markersRef.current = [];

                // Add markers
                locations.forEach((location) => {
                    // Marker here will be AdvancedMarkerElement in newer API
                    const marker = new Marker({
                        position: { lat: location.lat, lng: location.lng },
                        map,
                        title: location.name,
                    });

                    // AdvancedMarkerElement uses addListener? Some versions use event system.
                    // This works for classic markers; for AdvancedMarkerElement, use click listener if present.
                    if (typeof marker.addListener === 'function') {
                        marker.addListener('click', () => onSelectLocation?.(location));
                    } else if (marker.element) {
                        marker.element.addEventListener('click', () => onSelectLocation?.(location));
                    }

                    markersRef.current.push(marker);
                });
            } catch (err) {
                console.error(err);
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
                inset: 0,
                width: '100%',
                height: '100%',
            }}
        />
    );
}