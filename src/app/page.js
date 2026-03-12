"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Box, Stack, Paper, Typography, Tooltip } from "@mui/material";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";

import SearchIcon        from "@mui/icons-material/Search";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import InfoOutlinedIcon  from "@mui/icons-material/InfoOutlined";
import RouteIcon         from "@mui/icons-material/Route";
import AddIcon           from "@mui/icons-material/Add";
import RemoveIcon        from "@mui/icons-material/Remove";
import MyLocationIcon    from "@mui/icons-material/MyLocation";
import HomeIcon          from "@mui/icons-material/Home";
import ViewInArIcon      from "@mui/icons-material/ViewInAr";

import { locations } from "./data/locations";
import NavHUD        from "./components/NavHUD";
import NavBottomCard from "./components/NavBottomCard";
import SearchDrawer  from "./components/SearchDrawer";

// ─────────────────────────────────────────────────────────────────────────────
// 🖼  LOGO CONFIG
// To use your own logo image:
//   1. Drop your image into /public/logo.png  (or .svg / .jpg)
//   2. Set USE_CUSTOM_LOGO = true
//   3. Update LOGO_SRC to match your filename e.g. "/logo.png"
// If USE_CUSTOM_LOGO is false, the default compass emoji badge shows instead.
// ─────────────────────────────────────────────────────────────────────────────
const USE_CUSTOM_LOGO = false;          // ← set true once you add your image
const LOGO_SRC        = "/logo.png";   // ← path inside /public folder

const CAMPUS_LNG = -6.37824;
const CAMPUS_LAT = 53.405292;

const MapView = dynamic(() => import("./components/MapView"), {
    ssr: false,
    loading: () => <Box sx={{ height: "100dvh", width: "100vw", bgcolor: "#f1f5f9" }} />,
});

// ── Sidebar button ─────────────────────────────────────────────────────────
function SideBtn({ icon, label, onClick, active, tooltip, danger }) {
    return (
        <Tooltip title={tooltip} placement="left" arrow>
            <Box
                onClick={onClick}
                sx={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    gap: "4px", py: "11px", px: "8px",
                    cursor: "pointer", userSelect: "none",
                    color: danger  ? "#ef4444"
                         : active  ? "#1BA39C"
                         : "#475569",
                    bgcolor: active  ? "rgba(27,163,156,0.1)"
                           : danger  ? "rgba(239,68,68,0.07)"
                           : "transparent",
                    borderRadius: "10px",
                    transition: "all 0.16s",
                    "&:hover": {
                        bgcolor: danger ? "rgba(239,68,68,0.13)" : "rgba(27,163,156,0.12)",
                        color:   danger ? "#dc2626" : "#1BA39C",
                    },
                }}
            >
                {icon}
                <Typography sx={{ fontSize: 10, fontWeight: 700, lineHeight: 1, letterSpacing: "0.02em", color: "inherit" }}>
                    {label}
                </Typography>
            </Box>
        </Tooltip>
    );
}

function SideDivider() {
    return <Box sx={{ height: "1px", bgcolor: "#f1f5f9", mx: "6px" }} />;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
    const router  = useRouter();
    const mapRef  = useRef(null);
    const [isMounted, setIsMounted]       = useState(false);
    const [searchOpen, setSearchOpen]     = useState(false);
    const [query, setQuery]               = useState("");
    const [navTarget, setNavTarget]       = useState(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [gpsLocation, setGpsLocation]   = useState(null);
    const [is3D, setIs3D]                 = useState(false);

    const [viewState, setViewState] = useState({
        longitude: CAMPUS_LNG, latitude: CAMPUS_LAT,
        zoom: 16, pitch: 0, bearing: 0,
    });

    useEffect(() => { setIsMounted(true); }, []);

    useEffect(() => {
        if (!navigator.geolocation) return;
        const id = navigator.geolocation.watchPosition(
            p => setGpsLocation({ lng: p.coords.longitude, lat: p.coords.latitude }),
            () => {},
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
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

    const handleSelectLocation = (loc) => {
        setNavTarget(loc); setIsNavigating(false);
        setSearchOpen(false); setQuery("");
    };

    const handleZoomIn    = () => setViewState(v => ({ ...v, zoom: Math.min(v.zoom + 1, 20) }));
    const handleZoomOut   = () => setViewState(v => ({ ...v, zoom: Math.max(v.zoom - 1, 0) }));
    const handleToggle3D  = () => {
        const next = !is3D;
        setIs3D(next);
        setViewState(p => ({ ...p, pitch: next ? 60 : 0, duration: 900 }));
    };

    // Recenter to campus centre
    const handleRecenterCampus = () =>
        setViewState(p => ({ ...p, longitude: CAMPUS_LNG, latitude: CAMPUS_LAT, zoom: 16, pitch: 0, duration: 1100 }));

    // Recenter to user GPS (only active when GPS fix exists)
    const handleRecenterGPS = () => {
        if (!gpsLocation) return;
        setViewState(p => ({ ...p, longitude: gpsLocation.lng, latitude: gpsLocation.lat, zoom: 18, pitch: 0, duration: 1200 }));
    };

    const filtered = (Array.isArray(locations) ? locations : []).filter(l =>
        l.name?.toLowerCase().includes(query.toLowerCase()) ||
        l.id?.toLowerCase().includes(query.toLowerCase())
    );

    if (!isMounted) return null;

    return (
        <Box sx={{ height: "100dvh", width: "100vw", display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* ══ HEADER ══════════════════════════════════════════════════════ */}
            <Box sx={{
                flexShrink: 0, height: { xs: 56, sm: 62 },
                bgcolor: "rgba(255,255,255,0.97)", backdropFilter: "blur(10px)",
                display: "flex", alignItems: "center",
                px: { xs: 1.5, sm: 2.5 },
                borderBottom: "1px solid #e2e8f0", zIndex: 1100,
            }}>
                {/* ── Logo area ── */}
                <Stack direction="row" alignItems="center" spacing={1.25} sx={{ flex: 1 }}>
                    {USE_CUSTOM_LOGO ? (
                        /* Your custom logo image — swap logo.png in /public */
                        <Box sx={{ width: 34, height: 34, borderRadius: "9px", overflow: "hidden", flexShrink: 0, border: "1px solid #e2e8f0" }}>
                            <Image src={LOGO_SRC} alt="Campus Quest logo" width={34} height={34} style={{ objectFit: "cover" }} />
                        </Box>
                    ) : (
                        /* Default badge — replace with USE_CUSTOM_LOGO=true when ready */
                        <Box sx={{
                            width: 34, height: 34, borderRadius: "9px", flexShrink: 0,
                            background: "linear-gradient(135deg, #1BA39C 0%, #0e6d68 100%)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 17, boxShadow: "0 2px 8px rgba(27,163,156,0.3)",
                        }}>🧭</Box>
                    )}
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e293b", fontSize: { xs: "1rem", sm: "1.15rem" }, letterSpacing: "-0.01em" }}>
                        Campus Quest
                    </Typography>
                </Stack>

                {/* ── Header nav pills ── */}
                <Stack direction="row" spacing={1}>
                    {[
                        { label: "Info",   icon: <InfoOutlinedIcon sx={{ fontSize: 15 }} />, path: "/info" },
                        { label: "Trails", icon: <RouteIcon        sx={{ fontSize: 15 }} />, path: "/trails" },
                    ].map(btn => (
                        <Tooltip key={btn.label} title={btn.label} placement="bottom">
                            <Box onClick={() => router.push(btn.path)} sx={{
                                display: "flex", alignItems: "center", gap: "5px",
                                px: 1.5, py: 0.7, borderRadius: "20px",
                                border: "1px solid #e2e8f0", bgcolor: "#f8fafc",
                                cursor: "pointer", transition: "all 0.15s", color: "#475569",
                                "&:hover": { bgcolor: "#f0fdfa", borderColor: "#1BA39C", color: "#1BA39C" },
                            }}>
                                {btn.icon}
                                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "inherit", display: { xs: "none", sm: "block" } }}>
                                    {btn.label}
                                </Typography>
                            </Box>
                        </Tooltip>
                    ))}
                </Stack>
            </Box>

            {/* ══ MAP ═════════════════════════════════════════════════════════ */}
            <Box sx={{ flex: 1, position: "relative", minHeight: 0 }}>
                <MapView
                    viewState={viewState}
                    onMove={evt => setViewState(evt.viewState)}
                    onMapLoad={map => (mapRef.current = map)}
                    navTarget={navTarget}
                    isNavigating={isNavigating}
                    onTrailSaved={fetchTrails}
<<<<<<< HEAD

=======
                    is3D={is3D}
>>>>>>> 0af1e66492fe2aed5960d5f6373fd92db4cb1b67
                />

                {/* ── Sidebar control card ── */}
                <Paper elevation={3} sx={{
                    position: "absolute",
                    right: { xs: 12, sm: 16 },
                    top: { xs: 14, sm: 18 },
                    zIndex: 10,
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "1px solid #e2e8f0",
                    width: 62,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
                    bgcolor: "rgba(255,255,255,0.97)",
                    backdropFilter: "blur(10px)",
                }}>
                    {/* 3D toggle */}
                    <SideBtn
                        icon={<ViewInArIcon sx={{ fontSize: 22 }} />}
                        label="3D"
                        onClick={handleToggle3D}
                        active={is3D}
                        tooltip={is3D ? "Switch to 2D" : "Switch to 3D"}
                    />

                    <SideDivider />

                    {/* Zoom in */}
                    <SideBtn
                        icon={<AddIcon sx={{ fontSize: 22 }} />}
                        label="In"
                        onClick={handleZoomIn}
                        tooltip="Zoom in"
                    />
                    {/* Zoom out */}
                    <SideBtn
                        icon={<RemoveIcon sx={{ fontSize: 22 }} />}
                        label="Out"
                        onClick={handleZoomOut}
                        tooltip="Zoom out"
                    />

                    <SideDivider />

                    {/* Recenter on campus */}
                    <SideBtn
                        icon={<HomeIcon sx={{ fontSize: 22 }} />}
                        label="Campus"
                        onClick={handleRecenterCampus}
                        tooltip="Recenter on campus"
                    />
                    {/* Recenter on user GPS */}
                    <SideBtn
                        icon={<MyLocationIcon sx={{ fontSize: 22 }} />}
                        label="Me"
                        onClick={handleRecenterGPS}
                        active={!!gpsLocation}
                        tooltip={gpsLocation ? "Go to my location" : "Waiting for GPS…"}
                    />
                </Paper>

                {isNavigating && navTarget && (
                    <NavHUD navTarget={navTarget} onExit={() => { setNavTarget(null); setIsNavigating(false); }} />
                )}
                {navTarget && !isNavigating && (
                    <NavBottomCard navTarget={navTarget} onNavigate={() => setIsNavigating(true)} onDismiss={() => setNavTarget(null)} />
                )}
            </Box>

            {/* ══ BOTTOM SEARCH BAR ═══════════════════════════════════════════ */}
            {!isNavigating && (
                <Box sx={{
                    flexShrink: 0, display: "flex", alignItems: "center", gap: 1.5,
                    px: { xs: 2, sm: 3 }, pt: 1.5,
                    pb: { xs: "max(16px, env(safe-area-inset-bottom))", sm: "20px" },
                    bgcolor: "rgba(255,255,255,0.97)", borderTop: "1px solid #e2e8f0", zIndex: 1100,
                }}>
                    <Paper elevation={0} onClick={() => setSearchOpen(true)} sx={{
                        flex: 1, minWidth: 0, borderRadius: "14px",
                        display: "flex", alignItems: "center", px: 2,
                        height: { xs: 50, sm: 54 }, cursor: "pointer",
                        bgcolor: "#f8fafc", border: "1.5px solid #e2e8f0",
                        transition: "all 0.15s",
                        "&:hover": { borderColor: "#1BA39C", bgcolor: "#f0fdfa" },
                    }}>
                        <SearchIcon sx={{ color: "#94a3b8", mr: 1.5, fontSize: 20 }} />
                        <Typography noWrap sx={{ color: "#94a3b8", flex: 1, fontSize: { xs: "0.85rem", sm: "0.9rem" }, fontWeight: 500 }}>
                            Search buildings & locations...
                        </Typography>
                    </Paper>

                    <Tooltip title="Scan QR code" placement="top">
                        <Box onClick={() => router.push("/scan")} sx={{
                            bgcolor: "#1BA39C", color: "#fff",
                            width: { xs: 50, sm: 54 }, height: { xs: 50, sm: 54 },
                            borderRadius: "14px", flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 4px 14px rgba(27,163,156,0.4)",
                            cursor: "pointer", transition: "all 0.18s",
                            "&:hover": { bgcolor: "#15857f", transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(27,163,156,0.45)" },
                        }}>
                            <QrCodeScannerIcon sx={{ fontSize: 24 }} />
                        </Box>
                    </Tooltip>
                </Box>
            )}

            <SearchDrawer
                open={searchOpen}
                onClose={() => { setSearchOpen(false); setQuery(""); }}
                query={query} onQueryChange={setQuery}
                results={filtered} onSelect={handleSelectLocation}

            />

            <style>{`
                @keyframes slideUp { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
                @keyframes hudPulse { 0%,100% { box-shadow:0 0 0 3px rgba(27,163,156,0.3); } 50% { box-shadow:0 0 0 7px rgba(27,163,156,0.06); } }
            `}</style>
        </Box>
    );
}