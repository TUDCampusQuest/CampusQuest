"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Box } from "@mui/material";
import dynamic from "next/dynamic";

import { locations }    from "./data/locations";
import { BUILDINGS, BUILDING_LOOKUP } from "./data/mazemap-buildings";
import AppHeader        from "./components/AppHeader";
import MapSidebar       from "./components/MapSidebar";
import BottomBar        from "./components/BottomBar";
import NavHUD        from "./components/NavHUD";
import LocationSheet from "./components/LocationSheet";
import SearchDrawer     from "./components/SearchDrawer";
import StaffAuthModal   from "./components/StaffAuthModal";

const MapView = dynamic(() => import("./components/MapView"), {
    ssr: false,
    loading: () => <Box sx={{ height: "100dvh", width: "100vw", bgcolor: "#f1f5f9" }} />,
});

const CAMPUS_CENTER = { longitude: -6.37824, latitude: 53.405292 };

export default function Home() {
    const mapRef = useRef(null);

    const [isMounted,    setIsMounted]    = useState(false);
    const [searchOpen,   setSearchOpen]   = useState(false);
    const [query,        setQuery]        = useState("");
    const [authOpen,     setAuthOpen]     = useState(false);
    const [isAdmin,      setIsAdmin]      = useState(false);

    const [navTarget,        setNavTarget]        = useState(null);
    const [isNavigating,     setIsNavigating]     = useState(false);
    const [gpsLocation,      setGpsLocation]      = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [activeBuilding,   setActiveBuilding]   = useState(null);
    const [activeFloorId,    setActiveFloorId]    = useState(null);

    const [viewState, setViewState] = useState({
        ...CAMPUS_CENTER, zoom: 16, pitch: 0, bearing: 0,
    });

    useEffect(() => { setIsMounted(true); }, []);

    useEffect(() => {
        if (sessionStorage.getItem("cq_staff") === "true") setIsAdmin(true);
    }, []);

    useEffect(() => {
        if (!navigator.geolocation) return;
        const id = navigator.geolocation.watchPosition(
            p => setGpsLocation({ lng: p.coords.longitude, lat: p.coords.latitude }),
            () => {},
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
        );
        return () => navigator.geolocation.clearWatch(id);
    }, []);

    const fetchTrails = useCallback(async () => {
        try {
            const res  = await fetch("/api/trails", { cache: "no-store" });
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        } catch { return []; }
    }, []);

    useEffect(() => {
        fetchTrails();
        window.addEventListener("focus", fetchTrails);
        return () => window.removeEventListener("focus", fetchTrails);
    }, [fetchTrails]);

    const handleZoomIn   = () => setViewState(v => ({ ...v, zoom: Math.min(v.zoom + 1, 20) }));
    const handleZoomOut  = () => setViewState(v => ({ ...v, zoom: Math.max(v.zoom - 1, 0) }));
    const handleToggle3D = () => setViewState(p => ({ ...p, pitch: p.pitch === 0 ? 60 : 0, duration: 900 }));
    const handleRecenter = () => {
        const target = gpsLocation
            ? { longitude: gpsLocation.lng, latitude: gpsLocation.lat, zoom: 18 }
            : { ...CAMPUS_CENTER, zoom: 16 };
        setViewState(p => ({ ...p, ...target, pitch: 0, duration: 1200 }));
    };
    const handleStaffClick = () => {
        if (isAdmin) {
            sessionStorage.removeItem("cq_staff");
            setIsAdmin(false);
        } else {
            setAuthOpen(true);
        }
    };

    const matchBuildingFromLocation = (loc) => {
        if (!loc) return null;
        if (loc.buildingId && BUILDING_LOOKUP[loc.buildingId]) {
            return BUILDING_LOOKUP[loc.buildingId];
        }
        const text = ((loc.name || "") + " " + (loc.id || "")).toLowerCase().trim();
        if (!text) return null;
        const blockMatch = text.match(/block\s+([a-z])\b/);
        if (blockMatch) {
            const letter = blockMatch[1];
            const byBlock = BUILDINGS.find(b => new RegExp(`block\\s*${letter}\\b`, "i").test(b.name));
            if (byBlock) return byBlock;
        }
        return BUILDINGS.find(b => {
            const bname = b.name.toLowerCase();
            if (text.includes(bname) || bname.includes(text)) return true;
            const tokens = bname.split(/[\s\-()]+/).filter(t => t.length > 3);
            return tokens.some(tok => text.includes(tok));
        }) || null;
    };

    const handleSelectLocation = (loc) => {
        setSelectedLocation(loc);
        setSearchOpen(false);
        setQuery("");
        const matched = matchBuildingFromLocation(loc);
        if (matched) {
            setActiveBuilding(matched);
            const ground = matched.floors.find(f => f.z === 1) || matched.floors[0];
            setActiveFloorId(ground ? ground.floorId : null);
        } else {
            setActiveBuilding(null);
            setActiveFloorId(null);
        }
    };

    const handleNavigateFromSheet = (loc) => {
        setNavTarget(loc);
        setIsNavigating(true);
        setSelectedLocation(null);
    };

    const filtered = (Array.isArray(locations) ? locations : []).filter(l =>
        l.name?.toLowerCase().includes(query.toLowerCase()) ||
        l.id?.toLowerCase().includes(query.toLowerCase()),
    );

    if (!isMounted) return null;

    return (
        <Box sx={{ height: "100dvh", width: "100vw", display: "flex", flexDirection: "column", overflow: "hidden" }}>

            <AppHeader
                isAdmin={isAdmin}
                onStaffClick={handleStaffClick}
            />

            <Box sx={{ flex: 1, position: "relative", minHeight: 0 }}>
                <MapView
                    viewState={viewState}
                    onMove={evt => setViewState(evt.viewState)}
                    onMapLoad={map => (mapRef.current = map)}
                    navTarget={navTarget}
                    isNavigating={isNavigating}
                    onTrailSaved={fetchTrails}
                    isAdmin={isAdmin}
                    onLocationSelect={handleSelectLocation}
                    activeBuilding={activeBuilding}
                    activeFloorId={activeFloorId}
                    onFloorChange={setActiveFloorId}
                />

                <MapSidebar
                    pitch={viewState.pitch}
                    gpsLocation={gpsLocation}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onToggle3D={handleToggle3D}
                    onRecenter={handleRecenter}
                />

                {isNavigating && navTarget && (
                    <NavHUD
                        navTarget={navTarget}
                        onExit={() => { setNavTarget(null); setIsNavigating(false); }}
                    />
                )}
                {selectedLocation && !isNavigating && (
                    <LocationSheet
                        location={selectedLocation}
                        onClose={() => setSelectedLocation(null)}
                        onNavigate={handleNavigateFromSheet}
                    />
                )}

            </Box>

            {!isNavigating && (
                <BottomBar onSearchClick={() => setSearchOpen(true)} />
            )}

            <SearchDrawer
                open={searchOpen}
                onClose={() => { setSearchOpen(false); setQuery(""); }}
                query={query}
                onQueryChange={setQuery}
                results={filtered}
                onSelect={handleSelectLocation}
            />

            <StaffAuthModal
                open={authOpen}
                onClose={() => setAuthOpen(false)}
                onSuccess={() => setIsAdmin(true)}
            />

            <style>{`
                @keyframes slideUp  { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
                @keyframes hudPulse { 0%,100% { box-shadow:0 0 0 3px rgba(27,163,156,0.3); } 50% { box-shadow:0 0 0 7px rgba(27,163,156,0.06); } }
            `}</style>
        </Box>
    );
}