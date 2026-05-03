"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Box } from "@mui/material";
import dynamic from "next/dynamic";

import { locations }                   from "./data/locations";
import { BUILDINGS, BUILDING_LOOKUP }  from "./data/mazemap-buildings";
import AppHeader        from "./components/AppHeader";
import MapSidebar       from "./components/MapSidebar";
import BottomBar        from "./components/BottomBar";
import NavHUD           from "./components/NavHUD";
import LocationSheet    from "./components/LocationSheet";
import RoomSheet        from "./components/RoomSheet";
import SearchDrawer     from "./components/SearchDrawer";
import StaffAuthModal   from "./components/StaffAuthModal";
import NavigationDrawer from "./components/NavigationDrawer";
import useIndoorData    from "./hooks/useIndoorData";
import { useIndoorNavigation } from "./hooks/useIndoorNavigation";

const MapView = dynamic(() => import("./components/MapView"), {
    ssr: false,
    loading: () => <Box sx={{ height: "100dvh", width: "100vw", bgcolor: "#f1f5f9" }} />,
});

const CAMPUS_CENTER = { longitude: -6.37824, latitude: 53.405292 };

function haversineLocal([lng1, lat1], [lng2, lat2]) {
    const R = 6371000, r = d => d * Math.PI / 180;
    const dLat = r(lat2 - lat1), dLng = r(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Home() {
    const mapRef = useRef(null);

    const { rooms, stairs, floorplans, campusGraph, roomNameMap, loading, error } = useIndoorData();

    const [isMounted,    setIsMounted]    = useState(false);
    const [searchOpen,   setSearchOpen]   = useState(false);
    const [query,        setQuery]        = useState("");
    const [authOpen,     setAuthOpen]     = useState(false);
    const [isAdmin,      setIsAdmin]      = useState(false);

    const [navTarget,         setNavTarget]         = useState(null);
    const [isNavigating,      setIsNavigating]      = useState(false);
    const [gpsLocation,       setGpsLocation]       = useState(null);
    const [selectedLocation,  setSelectedLocation]  = useState(null);
    const [activeBuilding,    setActiveBuilding]     = useState(null);
    const [activeFloorName,   setActiveFloorName]   = useState(null);
    const [highlightedRoomId, setHighlightedRoomId] = useState(null);
    const [selectedRoom,      setSelectedRoom]      = useState(null);

    const [navDrawerOpen,    setNavDrawerOpen]    = useState(false);
    const [navPointA,        setNavPointA]        = useState(null);
    const [navPointB,        setNavPointB]        = useState(null);
    const [navStartOverride, setNavStartOverride] = useState(null);
    const [pickingNavPoint,  setPickingNavPoint]  = useState(null);

    const [viewState, setViewState] = useState({
        ...CAMPUS_CENTER, zoom: 16, pitch: 0, bearing: 0,
    });

    // ── Indoor navigation hook ──────────────────────────────────────────────
    const {
        activeRoute, currentStepIndex, arrivedMessage,
        handleNavigateTo, handleCancelNavigation,
    } = useIndoorNavigation({
        rooms, stairs, gpsLocation, mapRef,
        campusGraph,
        onHighlightRoom:      setHighlightedRoomId,
        onClearSelectedRoom:  () => setSelectedRoom(null),
        // Called when rooms are in different buildings — route outdoors between room centroids.
        // We prefer room centroid coordinates (no pin lookup) so Mapbox routes between the
        // actual room locations rather than the nearest pre-defined building marker.
        onOutdoorFallback: (destFeature, startFeature = null) => {
            const dp = destFeature?.properties;
            if (!dp || dp.centerLng == null || dp.centerLat == null) return;

            // Synthetic location objects whose IDs are not in locationNodeMap, which forces
            // useNavigation to use Mapbox walking directions between the exact coordinates.
            const navDest = {
                id:          `room-${dp.poiId}`,
                name:        dp.name || dp.roomCode || dp.buildingName || 'Destination',
                coordinates: [dp.centerLng, dp.centerLat],
            };
            setNavTarget(navDest);
            setIsNavigating(true);

            if (startFeature) {
                const sp = startFeature.properties;
                if (sp?.centerLng != null && sp?.centerLat != null) {
                    setNavStartOverride({
                        id:          `room-${sp.poiId}`,
                        name:        sp.name || sp.roomCode || sp.buildingName || 'Start',
                        coordinates: [sp.centerLng, sp.centerLat],
                    });
                }
            }
        },
    });

    // ── Lifecycle ───────────────────────────────────────────────────────────
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

    // Clear outdoor nav override when outdoor navigation session ends
    useEffect(() => {
        if (!isNavigating) setNavStartOverride(null);
    }, [isNavigating]);

    // ── Map-pick mode ────────────────────────────────────────────────────────
    const handleNavPick = useCallback((lngLat) => {
        if (!pickingNavPoint) return;
        let best = null, bestDist = Infinity;

        if (rooms?.features) {
            for (const f of rooms.features) {
                const p = f.properties;
                if (p.centerLng == null || p.centerLat == null) continue;
                const d = haversineLocal([lngLat.lng, lngLat.lat], [p.centerLng, p.centerLat]);
                if (d < bestDist) { bestDist = d; best = { type: 'room', label: p.name || p.roomCode, feature: f }; }
            }
        }

        if (bestDist > 50) {
            best = null;
            let locDist = Infinity;
            for (const loc of (Array.isArray(locations) ? locations : [])) {
                const c = loc.coordinates || [loc.lng, loc.lat];
                if (!c) continue;
                const d = haversineLocal([lngLat.lng, lngLat.lat], c);
                if (d < locDist) { locDist = d; best = { type: 'location', label: loc.name, loc }; }
            }
        }

        if (!best) return;
        if (pickingNavPoint === 'A') setNavPointA(best);
        else setNavPointB(best);
        setPickingNavPoint(null);
        setNavDrawerOpen(true);
    }, [pickingNavPoint, rooms]);

    // ── NavigationDrawer routing ─────────────────────────────────────────────
    const handleNavDrawerNavigate = useCallback((pointA, pointB) => {
        if (pointA.type === 'room' && pointB.type === 'room') {
            // Both rooms — handleNavigateTo handles same-building indoor route and
            // cross-building outdoor fallback (via onOutdoorFallback, which also sets start)
            handleNavigateTo(pointB.feature, pointA.feature);
        } else if (pointB.type === 'room') {
            if (pointA.type === 'gps' || pointA.type === 'room') {
                const startOverride = pointA.type === 'room' ? pointA.feature : null;
                handleNavigateTo(pointB.feature, startOverride);
            } else if (pointA.type === 'location') {
                // Outdoor location → room: route to room centroid via Mapbox
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

    // ── Map controls ─────────────────────────────────────────────────────────
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
        if (isAdmin) { sessionStorage.removeItem("cq_staff"); setIsAdmin(false); }
        else setAuthOpen(true);
    };

    // ── Location / building helpers ──────────────────────────────────────────
    const matchBuildingFromLocation = (loc) => {
        if (!loc) return null;
        if (loc.buildingId && BUILDING_LOOKUP[loc.buildingId]) return BUILDING_LOOKUP[loc.buildingId];
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
        const lng = loc.coordinates?.[0] ?? loc.lng;
        const lat = loc.coordinates?.[1] ?? loc.lat;
        if (lng != null && lat != null && mapRef.current) {
            mapRef.current.flyTo({ center: [lng, lat], zoom: 17.5, duration: 1200 });
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
            mapRef.current?.flyTo({ center: [p.centerLng, p.centerLat], zoom: 19.5, duration: 1200 });
        }
    }, []);

    const filtered = (Array.isArray(locations) ? locations : []).filter(l =>
        l.name?.toLowerCase().includes(query.toLowerCase()) ||
        l.id?.toLowerCase().includes(query.toLowerCase()),
    );

    // ── Guards ───────────────────────────────────────────────────────────────
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

    // ── Render ───────────────────────────────────────────────────────────────
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
                            ? handleCancelNavigation
                            : () => { setNavTarget(null); setIsNavigating(false); }}
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
                        roomNameMap={roomNameMap}
                    />
                )}

                {arrivedMessage && (
                    <Box sx={{
                        position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
                        zIndex: 30, background: "#00B4B4", color: "#fff",
                        fontWeight: 700, fontSize: 14, px: 3, py: 1.5,
                        borderRadius: 99, boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                        whiteSpace: "nowrap",
                    }}>
                        ✅ You have arrived!
                    </Box>
                )}
            </Box>

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

            <style>{`
                @keyframes slideUp  { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
                @keyframes hudPulse { 0%,100% { box-shadow:0 0 0 3px rgba(27,163,156,0.3); } 50% { box-shadow:0 0 0 7px rgba(27,163,156,0.06); } }
            `}</style>
        </Box>
    );
}
