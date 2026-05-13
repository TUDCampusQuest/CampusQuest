'use client';
// Handles session restore, GPS watch, trail deep-links, and room/building URL params on page load.
import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { locations } from '../data/locations';

export default function usePageSetup({
    setGpsLocation,
    setIsAdmin,
    setActiveNavSystem,
    setNavTarget,
    setIsNavigating,
    setActiveTrail,
    setCurrentTrailStopIndex,
    handleRoomSelect,
    rooms,
    mapRef,
}) {
    const searchParams = useSearchParams();

    // restore staff session from sessionStorage
    useEffect(() => {
        if (sessionStorage.getItem('cq_staff') === 'true') setIsAdmin(true);
    }, [setIsAdmin]);

    // watch device GPS and push updates to state
    useEffect(() => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) return;
        let id = null;
        try {
            id = navigator.geolocation.watchPosition(
                p => {
                    try {
                        if (p?.coords) setGpsLocation({ lng: p.coords.longitude, lat: p.coords.latitude });
                    } catch {}
                },
                () => {},
                { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
            );
        } catch {}
        return () => {
            if (id != null) {
                try { navigator.geolocation.clearWatch(id); } catch {}
            }
        };
    }, [setGpsLocation]);

    // load a trail that was saved to localStorage from the trails page
    useEffect(() => {
        const storedView  = localStorage.getItem('activeTrail');
        const storedStart = localStorage.getItem('startTrail');
        if (storedView) {
            localStorage.removeItem('activeTrail');
            try {
                const trail = JSON.parse(storedView);
                if (trail?.computedPath?.length) setActiveTrail(trail);
            } catch {}
        } else if (storedStart) {
            localStorage.removeItem('startTrail');
            try {
                const trail = JSON.parse(storedStart);
                if (trail?.computedPath?.length) {
                    setActiveTrail(trail);
                    setCurrentTrailStopIndex(0);
                }
            } catch {}
        }
    }, [setActiveTrail, setCurrentTrailStopIndex]);

    // select a room if selectedRoomId is in the URL (deep link)
    useEffect(() => {
        const roomId = searchParams.get('selectedRoomId');
        if (!roomId || !rooms?.features) return;
        const feature = rooms.features.find(f => String(f.properties.poiId) === String(roomId));
        if (feature) handleRoomSelect(feature);
    }, [searchParams, rooms, handleRoomSelect]);

    // start outdoor navigation if navTo/lng/lat are in the URL
    useEffect(() => {
        const navTo = searchParams.get('navTo');
        const lng   = parseFloat(searchParams.get('lng'));
        const lat   = parseFloat(searchParams.get('lat'));
        if (!navTo || isNaN(lng) || isNaN(lat)) return;
        const loc = locations.find(l => l.id.toUpperCase() === navTo.toUpperCase());
        if (!loc) return;
        setActiveNavSystem('outdoor');
        setNavTarget({ id: loc.id, name: loc.name, coordinates: [lng, lat] });
        setIsNavigating(true);
        if (mapRef.current) {
            try {
                mapRef.current.flyTo({ center: [lng, lat], zoom: 17, duration: 1400 });
            } catch (err) {
                console.warn('flyTo navTo suppressed:', err?.message || err);
            }
        }
    }, [searchParams]);

    const fetchTrails = useCallback(async () => {
        try {
            const res  = await fetch('/api/trails', { cache: 'no-store' });
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        } catch { return []; }
    }, []);

    useEffect(() => {
        fetchTrails();
        window.addEventListener('focus', fetchTrails);
        return () => window.removeEventListener('focus', fetchTrails);
    }, [fetchTrails]);

    return { fetchTrails };
}
