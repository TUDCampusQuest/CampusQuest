"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Box } from "@mui/material";
import dynamic from "next/dynamic";

import { locations }  from "./data/locations";
import AppHeader        from "./components/AppHeader";
import MapSidebar       from "./components/MapSidebar";
import BottomBar        from "./components/BottomBar";
import NavHUD           from "./components/NavHUD";
import LocationSheet    from "./components/LocationSheet";
import RoomSheet        from "./components/RoomSheet";
import SearchDrawer     from "./components/SearchDrawer";
import StaffAuthModal   from "./components/StaffAuthModal";
import OnboardingTour  from "./components/OnboardingTour";
import NavigationDrawer from "./components/NavigationDrawer";
import GeofenceBanner   from "./components/GeofenceBanner";
import QRModal          from "./components/QRModal";
import TrailStopCard    from "./components/TrailStopCard";
import useIndoorData    from "./hooks/useIndoorData";
import useGeofence      from "./hooks/useGeofence";
import { useIndoorNavigation } from "./hooks/useIndoorNavigation";
import useMapControls        from "./hooks/useMapControls";
import useLocationSelection  from "./hooks/useLocationSelection";
import { haversineM }        from "./lib/routeUtils";

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
            background: "#00B4B4", color: "#fff", fontWeight: 700,
            fontSize: 14, px: 3, py: 1.5, borderRadius: 99,
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)", whiteSpace: "nowrap",
        }}>
            ✅ You have arrived!
        </Box>
    );
}

function findNearestTapTarget(lngLat, rooms, locs) {
    let best = null, bestDist = Infinity;

    if (rooms?.features) {
        for (const f of rooms.features) {
            const p = f.properties;
            if (p.centerLng == null || p.centerLat == null) continue;
            const d = haversineM([lngLat.lng, lngLat.lat], [p.centerLng, p.centerLat]);
            if (d < bestDist) { bestDist = d; best = { type: 'room', label: p.name || p.roomCode, feature: f }; }
        }
    }

    if (bestDist > 50) {
        best = null;
        let locDist = Infinity;
        for (const loc of (Array.isArray(locs) ? locs : [])) {
            const c = loc.coordinates || [loc.lng, loc.lat];
            if (!c) continue;
            const d = haversineM([lngLat.lng, lngLat.lat], c);
            if (d < locDist) { locDist = d; best = { type: 'location', label: loc.name, loc }; }
        }
    }

    return best;
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

    const { rooms, stairs, floorplans, campusGraph, roomNameMap, entrances,
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
    const [pickingNavPoint,  setPickingNavPoint]  = useState(null);

    const [pickingIndoorStart, setPickingIndoorStart] = useState(false);
    const [pickingRoomStart,   setPickingRoomStart]   = useState(false);
    const [destinationRoom,    setDestinationRoom]    = useState(null);

    const [activeTrail,           setActiveTrail]           = useState(null);
    const [currentTrailStopIndex, setCurrentTrailStopIndex] = useState(0);

    const [qrOpen,          setQrOpen]          = useState(false);
    const [bannerDismissed, setBannerDismissed] = useState(false);
    const dismissTimerRef = useRef(null);

    const { nearestEntrance } = useGeofence({ userLocation: gpsLocation, entrances });

    const handleDismissBanner = () => {
        setBannerDismissed(true);
        dismissTimerRef.current = setTimeout(() => setBannerDismissed(false), 60000);
    };

    const {
        activeRoute, currentStepIndex, arrivedMessage,
        activeDestination,
        handleNavigateTo, handleCancelNavigation,
    } = useIndoorNavigation({
        rooms, stairs, gpsLocation, mapRef,
        campusGraph,
        onHighlightRoom:     setHighlightedRoomId,
        onClearSelectedRoom: () => setSelectedRoom(null),
        onOutdoorFallback: (destFeature, startFeature = null) => {
            const result = buildOutdoorFallback(destFeature, startFeature);
            if (!result) return;
            setNavTarget(result.navDest);
            setIsNavigating(true);
            if (result.navStart) setNavStartOverride(result.navStart);
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

    useEffect(() => {
        if (!isNavigating) setNavStartOverride(null);
    }, [isNavigating]);

    useEffect(() => {
        return () => { if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current); };
    }, []);

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

    const handleNavPick = useCallback((lngLat) => {
        if (!pickingNavPoint) return;
        const best = findNearestTapTarget(lngLat, rooms, locations);
        if (!best) return;
        if (pickingNavPoint === 'A') setNavPointA(best);
        else setNavPointB(best);
        setPickingNavPoint(null);
        setNavDrawerOpen(true);
    }, [pickingNavPoint, rooms]);

    const handleNavDrawerNavigate = useCallback((pointA, pointB) => {
        if (pointA.type === 'room' && pointB.type === 'room') {
            handleNavigateTo(pointB.feature, pointA.feature);
        } else if (pointB.type === 'room') {
            if (pointA.type === 'gps' || pointA.type === 'room') {
                const startOverride = pointA.type === 'room' ? pointA.feature : null;
                handleNavigateTo(pointB.feature, startOverride);
            } else if (pointA.type === 'location') {
                const dp = pointB.feature?.properties;
                if (dp?.centerLng != null && dp?.centerLat != null) {
                    setNavTarget({
                        id: `room-${dp.poiId}`,
                        name: dp.name || dp.roomCode || dp.buildingName || 'Destination',
                        coordinates: [dp.centerLng, dp.centerLat],
                    });
                    setIsNavigating(true);
                    setNavStartOverride(pointA.loc);
                }
            }
        } else if (pointB.type === 'location') {
            setNavTarget(pointB.loc);
            setIsNavigating(true);
            if (pointA.type === 'location') setNavStartOverride(pointA.loc);
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
        setNavTarget(loc);
        setIsNavigating(true);
        setSelectedLocation(null);
    };

    const handleRoomSelect = useCallback((feature) => {
        if (pickingRoomStart && destinationRoom) {
            setPickingRoomStart(false);
            handleNavigateTo(destinationRoom, feature);
            setDestinationRoom(null);
            return;
        }
        const p = feature.properties;
        setHighlightedRoomId(p.poiId);
        setSelectedRoom(feature);
        if (p.floorName) setActiveFloorName(p.floorName);
        if (p.centerLng != null && p.centerLat != null) {
            mapRef.current?.flyTo({ center: [p.centerLng, p.centerLat], zoom: 19.5, duration: 1200 });
        }
    }, [pickingRoomStart, destinationRoom]);

    useEffect(() => {
        const roomId = searchParams.get("selectedRoomId");
        if (!roomId || !rooms?.features) return;
        const feature = rooms.features.find(f => String(f.properties.poiId) === String(roomId));
        if (feature) handleRoomSelect(feature);
    }, [searchParams, rooms, handleRoomSelect]);

    const handleIndoorChangeStart = useCallback(() => {
        setPickingIndoorStart(true);
    }, []);

    const handleIndoorRoomPick = useCallback((feature) => {
        setPickingIndoorStart(false);
        if (activeDestination) handleNavigateTo(activeDestination, feature);
    }, [activeDestination, handleNavigateTo]);

    const handleNavigateFromRoom = useCallback((roomFeature) => {
        setDestinationRoom(roomFeature);
        setSelectedRoom(null);
        setPickingRoomStart(true);
    }, []);

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
                    activeRoute={activeRoute}
                    currentStepIndex={currentStepIndex}
                    navStart={navStartOverride}
                    pickingNavPoint={pickingNavPoint}
                    onNavPick={handleNavPick}
                    roomNameMap={roomNameMap}
                    pickingIndoorStart={pickingIndoorStart}
                    onIndoorRoomPick={handleIndoorRoomPick}
                    onIndoorChangeStart={handleIndoorChangeStart}
                    activeTrail={activeTrail}
                    onCloseTrail={() => { setActiveTrail(null); setCurrentTrailStopIndex(0); }}
                    pickingRoomStart={pickingRoomStart}
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
                            ? () => { handleCancelNavigation(); setPickingIndoorStart(false); }
                            : () => { setNavTarget(null); setIsNavigating(false); }}
                    />
                )}

                {nearestEntrance && !bannerDismissed && !isNavigating && !activeRoute && (
                    <GeofenceBanner
                        entrance={nearestEntrance}
                        onDismiss={handleDismissBanner}
                        onScanQR={() => setQrOpen(true)}
                    />
                )}

                {selectedLocation && !isNavigating && (
                    <LocationSheet
                        location={selectedLocation}
                        onClose={() => setSelectedLocation(null)}
                        onNavigate={handleNavigateFromSheet}
                    />
                )}

                {selectedRoom && !selectedLocation && !isNavigating && !activeRoute && (
                    <RoomSheet
                        selectedRoom={selectedRoom}
                        gpsLocation={gpsLocation}
                        onClose={() => { setSelectedRoom(null); setHighlightedRoomId(null); }}
                        onNavigate={handleNavigateTo}
                        onNavigateFrom={handleNavigateFromRoom}
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
                onClose={() => { setNavDrawerOpen(false); setPickingNavPoint(null); }}
                rooms={rooms}
                locations={locations}
                gpsLocation={gpsLocation}
                pointA={navPointA}
                onSetPointA={setNavPointA}
                pointB={navPointB}
                onSetPointB={setNavPointB}
                onPickFromMap={(field) => {
                    setPickingNavPoint(field);
                    setNavDrawerOpen(false);
                }}
                onNavigate={handleNavDrawerNavigate}
            />

            <StaffAuthModal
                open={authOpen}
                onClose={() => setAuthOpen(false)}
                onSuccess={() => setIsAdmin(true)}
            />

            <QRModal open={qrOpen} onClose={() => setQrOpen(false)} />

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
