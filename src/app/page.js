'use client';
// Root page — wires together the map, navigation, search, indoor routing, and all sheet/drawer UI.

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
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
import { ArrivedToast, PickFromMapBanner, StairsPrompt } from "./components/MapOverlays";
import useIndoorData         from "./hooks/useIndoorData";
import { useIndoorNavigation } from "./hooks/useIndoorNavigation";
import useMapControls        from "./hooks/useMapControls";
import useLocationSelection  from "./hooks/useLocationSelection";
import useNavDrawer, { buildOutdoorFallback } from "./hooks/useNavDrawer";
import usePageSetup          from "./hooks/usePageSetup";
import { isWithinCampus }    from "./lib/campusBounds";

const MapView = dynamic(() => import("./components/MapView"), {
    ssr: false,
    loading: () => <Box sx={{ height: "100dvh", width: "100vw", bgcolor: "#f1f5f9" }} />,
});

function Home() {
    const mapRef = useRef(null);

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

    const [navDrawerOpen,       setNavDrawerOpen]    = useState(false);
    const [navPointA,           setNavPointA]        = useState(null);
    const [navPointB,           setNavPointB]        = useState(null);
    const [navStartOverrideRaw, setNavStartOverride] = useState(null);
    const [showStairsPrompt,    setShowStairsPrompt] = useState(false);
    const [pickFromMapField,    setPickFromMapField] = useState(null);

    const navStartOverride = useMemo(() => navStartOverrideRaw, [navStartOverrideRaw?.id]);

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
            handleCancelNavigation();
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

    const { fetchTrails } = usePageSetup({
        setGpsLocation, setIsAdmin,
        setActiveNavSystem, setNavTarget, setIsNavigating,
        setActiveTrail, setCurrentTrailStopIndex,
        handleRoomSelect, rooms, mapRef,
    });

    const { handleNavDrawerNavigate } = useNavDrawer({
        handleNavigateTo, handleCancelNavigation,
        setActiveNavSystem, setNavTarget, setIsNavigating,
        setNavStartOverride, setNavDrawerOpen, setNavPointA, setNavPointB,
    });

    useEffect(() => { setIsMounted(true); }, []);

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

    const handleStaffClick = () => {
        if (isAdmin) { sessionStorage.removeItem("cq_staff"); setIsAdmin(false); }
        else setAuthOpen(true);
    };

    const handleNavigateFromSheet = (loc) => {
        const point = { type: 'location', label: loc.name || loc.id, loc };
        setNavPointB(point);
        const autoGps = gpsLocation && isWithinCampus(gpsLocation.lng, gpsLocation.lat)
            ? { type: 'gps', label: 'My Location', coords: [gpsLocation.lng, gpsLocation.lat] }
            : null;
        setNavPointA(autoGps);
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

    const handleRoomNavigateTo = useCallback((roomFeature) => {
        const p = roomFeature.properties;
        setNavPointB({ type: 'room', label: p.name || p.roomCode, feature: roomFeature });
        const autoGps = gpsLocation && isWithinCampus(gpsLocation.lng, gpsLocation.lat)
            ? { type: 'gps', label: 'My Location', coords: [gpsLocation.lng, gpsLocation.lat] }
            : null;
        setNavPointA(autoGps);
        setSelectedRoom(null);
        setHighlightedRoomId(null);
        setNavDrawerOpen(true);
    }, [gpsLocation]);

    const handleRoomSetAsStart = useCallback((roomFeature) => {
        const p = roomFeature.properties;
        setNavPointA({ type: 'room', label: p.name || p.roomCode, feature: roomFeature });
        setSelectedRoom(null);
        setNavDrawerOpen(true);
    }, []);

    const handlePickFromMap = useCallback((field) => {
        setNavDrawerOpen(false);
        setPickFromMapField(field);
    }, []);

    const handlePickPoint = useCallback((picked) => {
        const point = picked.type === 'room'
            ? { type: 'room', label: picked.feature.properties.name || picked.feature.properties.roomCode, feature: picked.feature }
            : { type: 'location', label: picked.loc.name || picked.loc.id, loc: picked.loc };
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

                <PickFromMapBanner
                    field={pickFromMapField}
                    onCancel={() => { setPickFromMapField(null); setNavDrawerOpen(true); }}
                />

                <StairsPrompt show={showStairsPrompt} floorName={activeFloorName} />

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

                {selectedLocation && !isNavigating && !activeRoute && (
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
                onRoomNavigate={handleRoomNavigateTo}
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
