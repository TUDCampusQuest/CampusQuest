"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Box, IconButton, Stack, Paper, Typography, Tooltip } from "@mui/material";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import SearchIcon        from "@mui/icons-material/Search";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import InfoOutlinedIcon  from "@mui/icons-material/InfoOutlined";
import RouteIcon         from "@mui/icons-material/Route";
import AddIcon           from "@mui/icons-material/Add";
import RemoveIcon        from "@mui/icons-material/Remove";
import MyLocationIcon    from "@mui/icons-material/MyLocation";
import ViewInArIcon      from "@mui/icons-material/ViewInAr";

import { locations } from "../data/locations";
import NavHUD from "../components/NavHUD";
import NavBottomCard from "../components/NavBottomCard";
import SearchDrawer from "../components/SearchDrawer";

const MapView = dynamic(() => import("../components/MapView"), {
    ssr: false,
    loading: () => <Box sx={{ height: "100dvh", width: "100vw", bgcolor: "#f1f5f9" }} />,
});
// ── Grouped sidebar button ────────────────────────────────────────────────────
function SideBtn({ icon, label, onClick, active, tooltip }) {
    return (
        <Tooltip title={tooltip} placement="left" arrow>
            <Box
                onClick={onClick}
                sx={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    gap: "3px", py: "9px", px: "6px",
                    cursor: "pointer",
                    color: active ? "#1BA39C" : "#64748b",
                    bgcolor: active ? "rgba(27,163,156,0.08)" : "transparent",
                    borderRadius: "10px",
                    transition: "all 0.16s",
                    "&:hover": { bgcolor: "rgba(27,163,156,0.1)", color: "#1BA39C" },
                    userSelect: "none",
                }}
            >
                {icon}
                <Typography sx={{ fontSize: 9, fontWeight: 700, lineHeight: 1, letterSpacing: "0.03em", color: "inherit" }}>
                    {label}
                </Typography>
            </Box>
        </Tooltip>
    );
}

// Thin divider inside the sidebar card
function SideDivider() {
    return <Box sx={{ height: "1px", bgcolor: "#f1f5f9", mx: "8px" }} />;
}

export default function Home() {
    const router  = useRouter();
    const mapRef  = useRef(null);
    const [isMounted, setIsMounted]       = useState(false);
    const [searchOpen, setSearchOpen]     = useState(false);
    const [query, setQuery]               = useState("");
    const [navTarget, setNavTarget]       = useState(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [gpsLocation, setGpsLocation]   = useState(null);

    const [viewState, setViewState] = useState({
        longitude: -6.37824, latitude: 53.405292,
        zoom: 16, pitch: 0, bearing: 0,
    });

    useEffect(() => { setIsMounted(true); }, []);

    // Watch GPS for recenter-to-me button
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

    const handleZoomIn   = () => setViewState(v => ({ ...v, zoom: Math.min(v.zoom + 1, 20) }));
    const handleZoomOut  = () => setViewState(v => ({ ...v, zoom: Math.max(v.zoom - 1, 0) }));
    const handleToggle3D = () => setViewState(p => ({ ...p, pitch: p.pitch === 0 ? 60 : 0, duration: 900 }));
    const handleRecenter = () => {
        const target = gpsLocation
            ? { longitude: gpsLocation.lng, latitude: gpsLocation.lat, zoom: 18 }
            : { longitude: -6.37824, latitude: 53.405292, zoom: 16 };
        setViewState(p => ({ ...p, ...target, pitch: 0, duration: 1200 }));
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
                flexShrink: 0, height: { xs: 56, sm: 60 },
                bgcolor: "rgba(255,255,255,0.97)", backdropFilter: "blur(10px)",
                display: "flex", alignItems: "center",
                px: { xs: 1.5, sm: 2.5 },
                borderBottom: "1px solid #e2e8f0", zIndex: 1100,
            }}>
                {/* Logo + title */}
                <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
                    <Box sx={{
                        width: 30, height: 30, borderRadius: "8px",
                        background: "linear-gradient(135deg, #1BA39C 0%, #0e6d68 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 15, flexShrink: 0,
                    }}>🧭</Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e293b", fontSize: { xs: "1rem", sm: "1.15rem" } }}>
                        Campus Quest
                    </Typography>
                </Stack>

                {/* Header action buttons — pill style */}
                <Stack direction="row" spacing={1}>
                    <Tooltip title="App info" placement="bottom">
                        <Box onClick={() => router.push("/info")} sx={{
                            display: "flex", alignItems: "center", gap: "5px",
                            px: 1.5, py: 0.6, borderRadius: "20px",
                            border: "1px solid #e2e8f0", bgcolor: "#f8fafc",
                            cursor: "pointer", transition: "all 0.15s",
                            "&:hover": { bgcolor: "#f0fdfa", borderColor: "#1BA39C" },
                        }}>
                            <InfoOutlinedIcon sx={{ fontSize: 15, color: "#64748b" }} />
                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#475569", display: { xs: "none", sm: "block" } }}>Info</Typography>
                        </Box>
                    </Tooltip>

                    <Tooltip title="Campus trails" placement="bottom">
                        <Box onClick={() => router.push("/trails")} sx={{
                            display: "flex", alignItems: "center", gap: "5px",
                            px: 1.5, py: 0.6, borderRadius: "20px",
                            border: "1px solid #e2e8f0", bgcolor: "#f8fafc",
                            cursor: "pointer", transition: "all 0.15s",
                            "&:hover": { bgcolor: "#f0fdfa", borderColor: "#1BA39C" },
                        }}>
                            <RouteIcon sx={{ fontSize: 15, color: "#64748b" }} />
                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#475569", display: { xs: "none", sm: "block" } }}>Trails</Typography>
                        </Box>
                    </Tooltip>
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
                    isAdmin={true}

                />

                {/* ── Sidebar controls — right edge, grouped card ── */}
                <Paper elevation={3} sx={{
                    position: "absolute",
                    right: { xs: 10, sm: 14 },
                    top: { xs: 12, sm: 16 },
                    zIndex: 10,
                    borderRadius: "14px",
                    overflow: "hidden",
                    border: "1px solid #e2e8f0",
                    width: 52,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}>
                    <SideBtn
                        icon={<ViewInArIcon sx={{ fontSize: 18 }} />}
                        label="3D"
                        onClick={handleToggle3D}
                        active={viewState.pitch > 0}
                        tooltip={viewState.pitch > 0 ? "Switch to 2D" : "Switch to 3D"}
                    />
                    <SideDivider />
                    <SideBtn
                        icon={<AddIcon sx={{ fontSize: 18 }} />}
                        label="In"
                        onClick={handleZoomIn}
                        tooltip="Zoom in"
                    />
                    <SideBtn
                        icon={<RemoveIcon sx={{ fontSize: 18 }} />}
                        label="Out"
                        onClick={handleZoomOut}
                        tooltip="Zoom out"
                    />
                    <SideDivider />
                    <SideBtn
                        icon={<MyLocationIcon sx={{ fontSize: 18 }} />}
                        label="Me"
                        onClick={handleRecenter}
                        active={!!gpsLocation}
                        tooltip={gpsLocation ? "Go to my location" : "Recenter on campus"}
                    />
                </Paper>

                {isNavigating && navTarget && (
                    <NavHUD navTarget={navTarget} onExit={() => { setNavTarget(null); setIsNavigating(false); }} />
                )}
                {navTarget && !isNavigating && (
                    <NavBottomCard navTarget={navTarget} onNavigate={() => setIsNavigating(true)} onDismiss={() => setNavTarget(null)} />
                )}
            </Box>

            {/* ══ BOTTOM BAR ══════════════════════════════════════════════════ */}
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
                        <SearchIcon sx={{ color: "#94a3b8", mr: 1.5, flexShrink: 0, fontSize: 20 }} />
                        <Typography noWrap sx={{ color: "#94a3b8", flex: 1, fontSize: { xs: "0.85rem", sm: "0.9rem" }, fontWeight: 500 }}>
                            Search buildings & locations...
                        </Typography>
                    </Paper>

                    <Tooltip title="Scan QR code" placement="top">
                        <IconButton onClick={() => router.push("/scan")} sx={{
                            bgcolor: "#1BA39C", color: "#fff",
                            width: { xs: 50, sm: 54 }, height: { xs: 50, sm: 54 },
                            borderRadius: "14px", flexShrink: 0,
                            boxShadow: "0 4px 14px rgba(27,163,156,0.4)",
                            "&:hover": { bgcolor: "#15857f", transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(27,163,156,0.45)" },
                            transition: "all 0.18s",
                        }}>
                            <QrCodeScannerIcon />
                        </IconButton>
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