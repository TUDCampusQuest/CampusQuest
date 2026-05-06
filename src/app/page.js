'use client';
// Root page — wires together the map, navigation, search, indoor routing, and all sheet/drawer UI.

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Box } from "@mui/material";
import dynamic from "next/dynamic";

import { locations }         from "./data/locations";
import AppHeader             from "./components/AppHeader";
import MapSidebar            from "./components/MapSidebar";
import BottomBar             from "./components/BottomBar";
import NavHUD                from "./components/NavHUD";
import LocationSheet         from "./components/LocationSheet";
import RoomSheet             from "./components/RoomSheet";
import SearchDrawer          from "./components/SearchDrawer";
import StaffAuthModal        from "./components/StaffAuthModal";
import OnboardingTour        from "./components/OnboardingTour";
import NavigationDrawer      from "./components/NavigationDrawer";
import TrailStopCard         from "./components/TrailStopCard";
import useIndoorData         from "./hooks/useIndoorData";
import { useIndoorNavigation } from "./hooks/useIndoorNavigation";
import useMapControls        from "./hooks/useMapControls";
import useLocationSelection  from "./hooks/useLocationSelection";

const MapView = dynamic(() => import("./components/MapView"), {
    ssr: false,
    loading: () => <Box sx={{ height: "100dvh", width: "100vw", bgcolor: "#f1f5f9" }} />,
});

function ArrivedToast({ show }) {
    if (!show) return null;
    return (
        <Box sx={{
            position: "absolute", top: 16, left: "50%",
            transform: "translateX(-50%)", zIndex: 30,
            background: "#7C3AED", color: "#fff", fontWeight: 700,
            fontSize: 14, px: 3, py: 1.5, borderRadius: 99,
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)", whiteSpace: "nowrap",
        }}>
            ✅ You have arrived!
        </Box>
    );
}

function buildOutdoorFallback(destFeature, startFeature = null) {
    const dp = destFeature?.properties;
    if (!dp || dp.centerLng == null || dp.centerLat == null) return null;

    const navDest = {
        id:          `room-${dp.poiId}`,
        name:        dp.name || dp.roomCode || dp.buildingName || 'Destination',
        coordinates: [dp.centerLng, dp.centerLat],
    };

    let navStart = null;
    if (startFeature) {
        const sp = startFeature.properties;
        if (sp?.centerLng != null && sp?.centerLat != null) {
            navStart = {
                id:          `room-${sp.poiId}`,
                name:        sp.name || sp.roomCode || sp.buildingName || 'Start',
                coordinates: [sp.centerLng, sp.centerLat],
            };
        }
    }

    return { navDest, navStart };
}

function Home() {
    const mapRef = useRef(null);
    const searchParams = useSearchParams();

    const { rooms, stairs, floorplans, campusGraph, roomNameMap,
            buildings, buildingLookup, loading, error } = useIndoorData();

    const [isMounted,    setIsMounted]    = useState(false);
    const [searchOpen,   setSearchOpen]   = useState(false);
    const [query,        setQuery]        = useState("");
    const [authOpen,     setAuthOpen]     = useState(false);
    const [isAdmin,      setIsAdmin]      = useState(false);

    const [navTarget,         setNavTarget]         = useState(null);
    const [isNavigating,      setIsNavigating]      = useState(false);
    const [gpsLocation,       setGpsLocation]       = useState(null);
    const [highlightedRoomId, setHighlightedRoomId] = useState(null);
    const [selectedRoom,      setSelectedRoom]      = useState(null);

    const [navDrawerOpen,    setNavDrawerOpen]    = useState(false);
    const [navPointA,        setNavPointA]        = useState(null);
    const [navPointB,        setNavPointB]        = useState(null);
    const [navStartOverride, setNavStartOverride] = useState(null);
    const [showStairsPrompt, setShowStairsPrompt] = useState(false);
    const [pickFromMapField, setPickFromMapField] = useState(null);

    const [activeNavSystem, setActiveNavSystem] = useState(null);

    const [activeTrail,           setActiveTrail]           = useState(null);
    const [currentTrailStopIndex, setCurrentTrailStopIndex] = useState(0);

    const {
        activeRoute, currentStepIndex, arrivedMessage,
        handleNavigateTo, handleCancelNavigation,
    } = useIndoorNavigation({
        rooms, stairs, gpsLocation, mapRef,
        campusGraph,
        activeNavSystem,
        onHighlightRoom:     setHighlightedRoomId,
        onClearSelectedRoom: () => setSelectedRoom(null),
        onOutdoorFallback: (destFeature, startFeature = null) => {
            const result = buildOutdoorFallback(destFeature, startFeature);
            if (!result) return;
            setActiveNavSystem('outdoor');
            setNavTarget(result.navDest);
            setIsNavigating(true);
            if (result.navStart) setNavStartOverride(result.navStart);
        },
        onFloorChange: (floor, showPrompt) => {
            setActiveFloorName(floor);
            if (showPrompt) setShowStairsPrompt(true);
        },
    });

    const { viewState, setViewState, handleZoomIn, handleZoomOut, handleToggle3D, handleRecenter } =
        useMapControls({ gpsLocation });

    const {
        selectedLocation, setSelectedLocation,
        activeBuilding,
        activeFloorName,  setActiveFloorName,
        handleSelectLocation,
    } = useLocationSelection({ mapRef, setSearchOpen, setQuery, buildings, buildingLookup });

    useEffect(() => { setIsMounted(true); }, []);

    useEffect(() => {
        if (sessionStorage.getItem("cq_staff") === "true") setIsAdmin(true);
    }, []);

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

    useEffect(() => {
        if (!isNavigating) {
            setNavStartOverride(null);
            setActiveNavSystem(prev => prev === 'outdoor' ? null : prev);
        }
    }, [isNavigating]);

    useEffect(() => {
        if (!showStairsPrompt) return;
        const t = setTimeout(() => setShowStairsPrompt(false), 4000);
        return () => clearTimeout(t);
    }, [showStairsPrompt]);

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
    }, []);

    const handleNavDrawerNavigate = useCallback((pointA, pointB) => {
        const toLocObj = (pt) => {
            if (!pt) return null;
            if (pt.type === 'location') return pt.loc;
            if (pt.type === 'gps' || pt.type === 'coords')
                return { id: pt.type, name: pt.label, coordinates: pt.coords };
            if (pt.type === 'room') {
                const p = pt.feature?.properties;
                if (p?.centerLng != null && p?.centerLat != null)
                    return { id: `room-${p.poiId}`, name: p.name || p.roomCode, coordinates: [p.centerLng, p.centerLat] };
            }
            return null;
        };

        if (pointA.type === 'room' && pointB.type === 'room') {
            setActiveNavSystem('indoor');
            setIsNavigating(false);
            setNavTarget(null);
            handleNavigateTo(pointB.feature, pointA.feature);
        } else if (pointB.type === 'room') {
            if (pointA.type === 'gps' || pointA.type === 'room') {
                setActiveNavSystem('indoor');
                setIsNavigating(false);
                setNavTarget(null);
                const startOverride = pointA.type === 'room' ? pointA.feature : null;
                handleNavigateTo(pointB.feature, startOverride);
            } else {
                const dp = pointB.feature?.properties;
                if (dp?.centerLng != null && dp?.centerLat != null) {
                    setActiveNavSystem('outdoor');
                    setNavTarget({
                        id: `room-${dp.poiId}`,
                        name: dp.name || dp.roomCode || dp.buildingName || 'Destination',
                        coordinates: [dp.centerLng, dp.centerLat],
                    });
                    setIsNavigating(true);
                    const startLoc = toLocObj(pointA);
                    if (startLoc) setNavStartOverride(startLoc);
                }
            }
        } else {
            const destLoc = toLocObj(pointB);
            if (destLoc) {
                setActiveNavSystem('outdoor');
                setNavTarget(destLoc);
                setIsNavigating(true);
                const startLoc = toLocObj(pointA);
                if (startLoc) setNavStartOverride(startLoc);
            }
        }

        setNavDrawerOpen(false);
        setNavPointA(null);
        setNavPointB(null);
    }, [handleNavigateTo]);

    const handleStaffClick = () => {
        if (isAdmin) { sessionStorage.removeItem("cq_staff"); setIsAdmin(false); }
        else setAuthOpen(true);
    };

    const handleNavigateFromSheet = (loc) => {
        const point = { type: 'location', label: loc.name || loc.id, loc };
        setNavPointB(point);
        setNavPointA(null);
        setSelectedLocation(null);
        setNavDrawerOpen(true);
    };

    const handleSetAsStartFromSheet = (loc) => {
        const point = { type: 'location', label: loc.name || loc.id, loc };
        setNavPointA(point);
        setNavPointB(null);
        setSelectedLocation(null);
        setNavDrawerOpen(true);
    };

    const handleSwapDestination = useCallback((loc) => {
        if (!loc?.id) return;
        if (navTarget?.id === loc.id) return;
        const coords = loc.coordinates || (loc.lng != null && loc.lat != null ? [loc.lng, loc.lat] : null);
        if (!coords) return;
        setActiveNavSystem('outdoor');
        setNavTarget({ id: loc.id, name: loc.name, coordinates: coords });
    }, [navTarget]);

    const handleRoomSelect = useCallback((feature) => {
        const p = feature.properties;
        setHighlightedRoomId(p.poiId);
        setSelectedRoom(feature);
        if (p.floorName) setActiveFloorName(p.floorName);
        if (p.centerLng != null && p.centerLat != null) {
            try {
                mapRef.current?.flyTo({ center: [p.centerLng, p.centerLat], zoom: 19.5, duration: 1200 });
            } catch (err) {
                console.warn('flyTo room suppressed:', err?.message || err);
            }
        }
    }, [setActiveFloorName]);

    useEffect(() => {
        const roomId = searchParams.get("selectedRoomId");
        if (!roomId || !rooms?.features) return;
        const feature = rooms.features.find(f => String(f.properties.poiId) === String(roomId));
        if (feature) handleRoomSelect(feature);
    }, [searchParams, rooms, handleRoomSelect]);

    useEffect(() => {
        const navTo = searchParams.get("navTo");
        const lng   = parseFloat(searchParams.get("lng"));
        const lat   = parseFloat(searchParams.get("lat"));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const handleRoomNavigateTo = useCallback((roomFeature) => {
        const p = roomFeature.properties;
        const point = {
            type: 'room',
            label: p.name || p.roomCode,
            feature: roomFeature,
        };
        setNavPointB(point);
        setNavPointA(null);
        setSelectedRoom(null);
        setHighlightedRoomId(null);
        setNavDrawerOpen(true);
    }, []);

    const handleRoomSetAsStart = useCallback((roomFeature) => {
        const p = roomFeature.properties;
        const point = {
            type: 'room',
            label: p.name || p.roomCode,
            feature: roomFeature,
        };
        setNavPointA(point);
        setSelectedRoom(null);
        setNavDrawerOpen(true);
    }, []);

    const handlePickFromMap = useCallback((field) => {
        setNavDrawerOpen(false);
        setPickFromMapField(field);
    }, []);

    const handlePickPoint = useCallback((picked) => {
        let point;
        if (picked.type === 'room') {
            const p = picked.feature.properties;
            point = { type: 'room', label: p.name || p.roomCode, feature: picked.feature };
        } else {
            point = { type: 'location', label: picked.loc.name || picked.loc.id, loc: picked.loc };
        }
        if (pickFromMapField === 'A') setNavPointA(point);
        else setNavPointB(point);
        setPickFromMapField(null);
        setNavDrawerOpen(true);
    }, [pickFromMapField]);

    const filtered = (Array.isArray(locations) ? locations : []).filter(l =>
        l.name?.toLowerCase().includes(query.toLowerCase()) ||
        l.id?.toLowerCase().includes(query.toLowerCase()),
    );

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
                onSearchClick={() => setSearchOpen(true)}
                onNavigateClick={() => setNavDrawerOpen(true)}
            />

            <Box sx={{ flex: 1, position: "relative", minHeight: 0 }}>

                {pickFromMapField && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0,
                        zIndex: 1060,
                        background: 'rgba(124,58,237,0.92)',
                        backdropFilter: 'blur(10px)',
                        padding: '14px 16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        color: '#fff', fontWeight: 700, fontSize: 14,
                    }}>
                        <span>📌 Tap the map to set {pickFromMapField === 'A' ? 'start point' : 'destination'}</span>
                        <button
                            onClick={() => { setPickFromMapField(null); setNavDrawerOpen(true); }}
                            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}
                        >✕</button>
                    </div>
                )}

                {showStairsPrompt && (
                    <div style={{
                        position: 'absolute', top: 60, left: 8, right: 8,
                        zIndex: 1050,
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid var(--glass-border)',
                        borderLeft: '4px solid #7C3AED',
                        borderRadius: 14,
                        padding: '12px 16px',
                        display: 'flex', alignItems: 'center', gap: 10,
                        boxShadow: 'var(--card-shadow)',
                        pointerEvents: 'none',
                    }}>
                        <span style={{ fontSize: 20 }}>🪜</span>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                                Head to the stairs
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                Your destination is on floor {activeFloorName} — map updated
                            </div>
                        </div>
                    </div>
                )}

                <MapView
                    viewState={viewState}
                    onMove={evt => setViewState(evt.viewState)}
                    onMapLoad={map => (mapRef.current = map)}
                    navTarget={navTarget}
                    isNavigating={isNavigating}
                    onTrailSaved={fetchTrails}
                    isAdmin={isAdmin}
                    onLocationSelect={handleSelectLocation}
                    onSwapDestination={handleSwapDestination}
                    activeBuilding={activeBuilding}
                    activeFloorName={activeFloorName}
                    rooms={rooms}
                    stairs={stairs}
                    floorplans={floorplans}
                    campusGraph={campusGraph}
                    highlightedRoomId={highlightedRoomId}
                    activeRoute={activeRoute}
                    currentStepIndex={currentStepIndex}
                    navStart={navStartOverride}
                    roomNameMap={roomNameMap}
                    activeTrail={activeTrail}
                    onCloseTrail={() => { setActiveTrail(null); setCurrentTrailStopIndex(0); }}
                    onRoomSelect={handleRoomSelect}
                    onRoomNavigate={handleRoomNavigateTo}
                    onMapTap={() => { setSelectedRoom(null); setHighlightedRoomId(null); }}
                    pickMode={!!pickFromMapField}
                    onPickPoint={handlePickPoint}
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

                {((isNavigating && navTarget) || activeRoute) && (
                    <NavHUD
                        navTarget={navTarget}
                        activeRoute={activeRoute}
                        onExit={activeRoute
                            ? () => { setActiveNavSystem(null); handleCancelNavigation(); }
                            : () => { setActiveNavSystem(null); setNavTarget(null); setIsNavigating(false); }}
                    />
                )}


                {selectedLocation && !isNavigating && (
                    <LocationSheet
                        location={selectedLocation}
                        onClose={() => setSelectedLocation(null)}
                        onNavigate={handleNavigateFromSheet}
                        onSetAsStart={handleSetAsStartFromSheet}
                    />
                )}

                {selectedRoom && !selectedLocation && !isNavigating && !activeRoute && (
                    <RoomSheet
                        selectedRoom={selectedRoom}
                        gpsLocation={gpsLocation}
                        onClose={() => { setSelectedRoom(null); setHighlightedRoomId(null); }}
                        onNavigateTo={handleRoomNavigateTo}
                        onSetAsStart={handleRoomSetAsStart}
                        roomNameMap={roomNameMap}
                    />
                )}

                <ArrivedToast show={arrivedMessage} />
            </Box>

            {!isNavigating && !activeRoute && (
                <TrailStopCard
                    activeTrail={activeTrail}
                    currentTrailStopIndex={currentTrailStopIndex}
                    onAdvance={() => setCurrentTrailStopIndex(i => i + 1)}
                    onClose={() => { setActiveTrail(null); setCurrentTrailStopIndex(0); }}
                />
            )}

            {!isNavigating && !activeRoute && (
                <BottomBar
                    onSearchClick={() => setSearchOpen(true)}
                    onToggle3D={handleToggle3D}
                    onRecenter={handleRecenter}
                    onNavigateClick={() => setNavDrawerOpen(true)}
                    gpsLocation={gpsLocation}
                    pitch={viewState.pitch}
                />
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
                roomNameMap={roomNameMap}
            />

            <NavigationDrawer
                open={navDrawerOpen}
                onClose={() => setNavDrawerOpen(false)}
                rooms={rooms}
                locations={locations}
                gpsLocation={gpsLocation}
                pointA={navPointA}
                onSetPointA={setNavPointA}
                pointB={navPointB}
                onSetPointB={setNavPointB}
                onNavigate={handleNavDrawerNavigate}
                onPickFromMap={handlePickFromMap}
            />

            <StaffAuthModal
                open={authOpen}
                onClose={() => setAuthOpen(false)}
                onSuccess={() => setIsAdmin(true)}
            />

            <OnboardingTour />
        </Box>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div style={{ height: "100dvh", width: "100vw", background: "#111" }} />}>
            <Home />
        </Suspense>
    );
}
