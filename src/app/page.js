"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Box, IconButton, Stack, Paper, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import SearchIcon from "@mui/icons-material/Search";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import LayersIcon from "@mui/icons-material/Layers";
import TerrainIcon from "@mui/icons-material/Terrain";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import MyLocationIcon from "@mui/icons-material/MyLocation";

import { locations } from "./data/locations";
import NavHUD from "./components/NavHUD";
import NavBottomCard from "./components/NavBottomCard";
import SearchDrawer from "./components/SearchDrawer";

const MapView = dynamic(() => import("./components/MapView"), {
    ssr: false,
    loading: () => <Box sx={{ height: "100dvh", width: "100vw", bgcolor: "#f1f5f9" }} />,
});

function SideButton({ children, onClick, active }) {
    return (
        <Paper elevation={2} onClick={onClick} sx={{
            width: 40, height: 40,
            display: "flex", justifyContent: "center", alignItems: "center",
            borderRadius: "50%", cursor: "pointer",
            color: active ? "#1BA39C" : "#475569",
            transition: "all 0.2s",
            "&:hover": { bgcolor: "#f8fafc" },
        }}>
            {children}
        </Paper>
    );
}

export default function Home() {
    const router  = useRouter();
    const mapRef  = useRef(null);
    const [isMounted, setIsMounted]       = useState(false);
    const [searchOpen, setSearchOpen]     = useState(false);
    const [query, setQuery]               = useState("");
    const [navTarget, setNavTarget]       = useState(null);
    const [isNavigating, setIsNavigating] = useState(false);

    const [viewState, setViewState] = useState({
        longitude: -6.37824, latitude: 53.405292,
        zoom: 16, pitch: 0, bearing: 0,
    });

    useEffect(() => { setIsMounted(true); }, []);

    const fetchTrails = useCallback(async () => {
        try {
            const res = await fetch("/api/trails", { cache: "no-store" });
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
        setNavTarget(loc);
        setIsNavigating(false);
        setSearchOpen(false);
        setQuery("");
    };

    const filtered = (Array.isArray(locations) ? locations : []).filter(l =>
        l.name?.toLowerCase().includes(query.toLowerCase()) ||
        l.id?.toLowerCase().includes(query.toLowerCase())
    );

    if (!isMounted) return null;

    return (
        <Box sx={{ height: "100dvh", width: "100vw", display: "flex", flexDirection: "column", bgcolor: "#f1f5f9", overflow: "hidden" }}>

            {/* ── Header ── */}
            <Box sx={{
                flexShrink: 0, height: { xs: 56, sm: 60 },
                bgcolor: "rgba(255,255,255,0.97)", backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center",
                px: { xs: 1.5, sm: 2 }, borderBottom: "1px solid #e2e8f0", zIndex: 1100,
            }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e293b", flex: 1, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                    Campus Quest
                </Typography>
                <Stack direction="row" spacing={0.5}>
                    <IconButton size="small" onClick={() => router.push("/info")}><InfoOutlinedIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => router.push("/trails")}><MapOutlinedIcon fontSize="small" /></IconButton>
                </Stack>
            </Box>

            {/* ── Map area ── */}
            <Box sx={{ flex: 1, position: "relative", minHeight: 0 }}>
                <MapView
                    viewState={viewState}
                    onMove={evt => setViewState(evt.viewState)}
                    onMapLoad={map => (mapRef.current = map)}
                    navTarget={navTarget}
                    isNavigating={isNavigating}
                    onTrailSaved={fetchTrails}
                />

                {/* Sidebar controls */}
                <Stack spacing={1.5} sx={{ position: "absolute", right: { xs: 10, sm: 16 }, top: { xs: 12, sm: 16 }, zIndex: 10 }}>
                    <SideButton><LayersIcon fontSize="small" /></SideButton>
                    <SideButton><TerrainIcon fontSize="small" /></SideButton>
                    <SideButton
                        onClick={() => setViewState(p => ({ ...p, pitch: p.pitch === 0 ? 60 : 0, duration: 1000 }))}
                        active={viewState.pitch > 0}
                    >
                        <Typography sx={{ fontWeight: 800, fontSize: "0.7rem" }}>3D</Typography>
                    </SideButton>
                    <Box sx={{ height: 4 }} />
                    <SideButton onClick={() => setViewState(v => ({ ...v, zoom: Math.min(v.zoom + 1, 20) }))}><AddIcon fontSize="small" /></SideButton>
                    <SideButton onClick={() => setViewState(v => ({ ...v, zoom: Math.max(v.zoom - 1, 0) }))}><RemoveIcon fontSize="small" /></SideButton>
                    <SideButton onClick={() => setViewState(p => ({ ...p, longitude: -6.37824, latitude: 53.405292, zoom: 16, pitch: 0, duration: 1000 }))}><MyLocationIcon fontSize="small" /></SideButton>
                </Stack>

                {/* Nav top banner — shown while navigating */}
                {isNavigating && navTarget && (
                    <NavHUD
                        navTarget={navTarget}
                        onExit={() => { setNavTarget(null); setIsNavigating(false); }}
                    />
                )}

                {/* Bottom card — shown when target selected before navigating */}
                {navTarget && !isNavigating && (
                    <NavBottomCard
                        navTarget={navTarget}
                        onNavigate={() => setIsNavigating(true)}
                        onDismiss={() => setNavTarget(null)}
                    />
                )}
            </Box>

            {/* ── Bottom search bar — hidden while navigating ── */}
            {!isNavigating && (
                <Box sx={{
                    flexShrink: 0, display: "flex", alignItems: "center", gap: 1.5,
                    px: { xs: 2, sm: 3 }, pt: 1.5,
                    pb: { xs: "max(16px, env(safe-area-inset-bottom))", sm: "20px" },
                    bgcolor: "rgba(241,245,249,0.98)", borderTop: "1px solid #e2e8f0", zIndex: 1100,
                }}>
                    <Paper elevation={2} onClick={() => setSearchOpen(true)} sx={{
                        flex: 1, minWidth: 0, borderRadius: "14px",
                        display: "flex", alignItems: "center", px: 2,
                        height: { xs: 50, sm: 54 }, cursor: "pointer",
                        bgcolor: "white", border: "1px solid #e2e8f0",
                    }}>
                        <SearchIcon sx={{ color: "#94a3b8", mr: 1, flexShrink: 0 }} />
                        <Typography noWrap sx={{ color: "#94a3b8", flex: 1, fontSize: { xs: "0.85rem", sm: "0.95rem" } }}>
                            Search TU Blanchardstown...
                        </Typography>
                    </Paper>
                    <IconButton onClick={() => router.push("/scan")} sx={{
                        bgcolor: "#1BA39C", color: "#fff",
                        width: { xs: 50, sm: 54 }, height: { xs: 50, sm: 54 },
                        borderRadius: "14px", flexShrink: 0,
                        boxShadow: "0 4px 14px rgba(27,163,156,0.4)",
                        "&:hover": { bgcolor: "#16867f" },
                    }}>
                        <QrCodeScannerIcon />
                    </IconButton>
                </Box>
            )}

            {/* Search drawer */}
            <SearchDrawer
                open={searchOpen}
                onClose={() => { setSearchOpen(false); setQuery(""); }}
                query={query}
                onQueryChange={setQuery}
                results={filtered}
                onSelect={handleSelectLocation}
            />

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
                @keyframes hudPulse {
                    0%, 100% { box-shadow: 0 0 0 3px rgba(27,163,156,0.3); }
                    50%      { box-shadow: 0 0 0 7px rgba(27,163,156,0.06); }
                }
            `}</style>
        </Box>
    );
}