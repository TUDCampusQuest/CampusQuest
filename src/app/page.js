"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
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
import useIndoorData from './hooks/useIndoorData';

const MapView = dynamic(() => import("./components/MapView"), {
    ssr: false,
    loading: () => <Box sx={{ height: "100dvh", width: "100vw", bgcolor: "#f1f5f9" }} />,
});

const CAMPUS_CENTER = { longitude: -6.37824, latitude: 53.405292 };

export default function Home() {
    const mapRef = useRef(null);

    const { rooms, stairs, floorplans, campusGraph, loading, error } = useIndoorData();

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
    const [activeFloorName,  setActiveFloorName]  = useState(null);
    const [highlightedRoomId, setHighlightedRoomId] = useState(null);
    const [selectedRoom,      setSelectedRoom]      = useState(null);

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
            setActiveFloorName(ground ? ground.name : null);
        } else {
            setActiveBuilding(null);
            setActiveFloorName(null);
        }
    };

    const handleNavigateFromSheet = (loc) => {
        setNavTarget(loc);
        setIsNavigating(true);
        setSelectedLocation(null);
    };

    const handleRoomSelect = useCallback((feature) => {
        const p = feature.properties;
        setHighlightedRoomId(p.poiId);
        setSelectedRoom(feature);
        if (p.floorName) setActiveFloorName(p.floorName);
        if (p.centerLng != null && p.centerLat != null) {
            mapRef.current?.flyTo({
                center: [p.centerLng, p.centerLat],
                zoom: 19.5,
                duration: 1200,
            });
        }
    }, []);

    const filtered = (Array.isArray(locations) ? locations : []).filter(l =>
        l.name?.toLowerCase().includes(query.toLowerCase()) ||
        l.id?.toLowerCase().includes(query.toLowerCase()),
    );

    console.log('Rooms count:', rooms?.features?.length, 'Stairs count:', stairs?.features?.length);

    if (!isMounted) return null;

    if (loading) return (
        <div style={{ height: "100dvh", width: "100vw", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: "1.1rem" }}>Loading campus data...</span>
        </div>
    );

    if (error) return (
        <div style={{ height: "100dvh", width: "100vw", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "red", fontSize: "1rem" }}>{error}</span>
        </div>
    );

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
                    activeFloorName={activeFloorName}
                    rooms={rooms}
                    stairs={stairs}
                    floorplans={floorplans}
                    campusGraph={campusGraph}
                    highlightedRoomId={highlightedRoomId}
                />

                <MapSidebar
                    pitch={viewState.pitch}
                    gpsLocation={gpsLocation}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onToggle3D={handleToggle3D}
                    onRecenter={handleRecenter}
                    activeFloorName={activeFloorName}
                    onFloorNameChange={setActiveFloorName}
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

                {selectedRoom && !selectedLocation && !isNavigating && (
                    <Box sx={{
                        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20,
                        background: "rgba(255,255,255,0.97)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        borderTop: "1px solid #e2e8f0",
                        borderRadius: "20px 20px 0 0",
                        boxShadow: "0 -4px 24px rgba(0,0,0,0.10)",
                        px: 2.5, py: 2,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                        <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: 16, lineHeight: 1.25, color: "#0f172a" }}>
                                {selectedRoom.properties.name || selectedRoom.properties.roomCode}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.4 }}>
                                {selectedRoom.properties.name && selectedRoom.properties.name !== selectedRoom.properties.roomCode
                                    ? `${selectedRoom.properties.roomCode} · ` : ""}
                                {selectedRoom.properties.buildingName}
                                {selectedRoom.properties.floorName
                                    ? ` · Floor ${selectedRoom.properties.floorName}` : ""}
                            </Typography>
                        </Box>
                        <IconButton
                            size="small"
                            onClick={() => { setSelectedRoom(null); setHighlightedRoomId(null); }}
                            sx={{ color: "#64748b" }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
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
                rooms={rooms}
                onRoomSelect={handleRoomSelect}
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