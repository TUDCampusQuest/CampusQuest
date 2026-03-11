"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    Box, IconButton, TextField, Drawer, List, ListItem, ListItemText,
    Typography, Stack, Paper
} from "@mui/material";
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
import CloseIcon from "@mui/icons-material/Close";
import NavigationIcon from "@mui/icons-material/Navigation";

import { locations } from "./data/locations";

const MapView = dynamic(() => import("./components/MapView"), {
    ssr: false,
    loading: () => <Box sx={{ height: "100dvh", width: "100vw", bgcolor: "#f1f5f9" }} />,
});

function SideButton({ children, onClick, active }) {
    return (
        <Paper
            elevation={2}
            onClick={onClick}
            sx={{
                width: 40, height: 40,
                display: "flex", justifyContent: "center", alignItems: "center",
                borderRadius: "50%", cursor: "pointer",
                color: active ? "#1BA39C" : "#475569",
                transition: "all 0.2s",
                "&:hover": { bgcolor: "#f8fafc" },
            }}
        >
            {children}
        </Paper>
    );
}

export default function Home() {
    const router = useRouter();
    const mapRef = useRef(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [isMounted, setIsMounted] = useState(false);

    // Navigation intent state — lifted here so page.js controls the bottom bar
    // and MapView reacts to the target via props
    const [navTarget, setNavTarget] = useState(null);
    const [isNavigating, setIsNavigating] = useState(false);

    // ── Live trail list fetched from S3 ──────────────────────────────────────
    const [trails, setTrails]           = useState([]);
    const [trailsLoading, setTrailsLoading] = useState(true);

    const fetchTrails = useCallback(async () => {
        setTrailsLoading(true);
        try {
            const res = await fetch("/api/trails", { cache: "no-store" });
            const data = await res.json();
            setTrails(Array.isArray(data) ? data : []);
        } catch {
            setTrails([]);
        } finally {
            setTrailsLoading(false);
        }
    }, []);

    // Fetch on mount; re-fetch whenever the tab regains focus (e.g. after saving
    // a trail in the designer the user comes back and the list is already fresh)
    useEffect(() => {
        fetchTrails();
        window.addEventListener("focus", fetchTrails);
        return () => window.removeEventListener("focus", fetchTrails);
    }, [fetchTrails]);

    const [viewState, setViewState] = useState({
        longitude: -6.37824,
        latitude: 53.405292,
        zoom: 16, pitch: 0, bearing: 0,
    });

    useEffect(() => { setIsMounted(true); }, []);

    const handleZoomIn  = () => setViewState(v => ({ ...v, zoom: Math.min(v.zoom + 1, 20) }));
    const handleZoomOut = () => setViewState(v => ({ ...v, zoom: Math.max(v.zoom - 1, 0) }));
    const handleToggle3D = () => setViewState(p => ({ ...p, pitch: p.pitch === 0 ? 60 : 0, duration: 1000 }));
    const handleRecenter = () => setViewState(p => ({ ...p, longitude: -6.37824, latitude: 53.405292, zoom: 16, pitch: 0, duration: 1000 }));

    // Called when user taps a result in the search drawer
    const handleSelectLocation = (loc) => {
        setNavTarget(loc);
        setIsNavigating(false);
        setSearchOpen(false);
        setQuery("");
    };

    const handleExitNavigation = () => {
        setNavTarget(null);
        setIsNavigating(false);
    };

    const filtered = (Array.isArray(locations) ? locations : []).filter(l =>
        l.name?.toLowerCase().includes(query.toLowerCase()) ||
        l.id?.toLowerCase().includes(query.toLowerCase())
    );

    if (!isMounted) return null;

    return (
        <Box sx={{
            height: "100dvh",
            width: "100vw",
            display: "flex",
            flexDirection: "column",
            bgcolor: "#f1f5f9",
            overflow: "hidden",
        }}>

            {/* ── HEADER ── */}
            <Box sx={{
                flexShrink: 0,
                height: { xs: 56, sm: 60 },
                bgcolor: "rgba(255,255,255,0.97)",
                backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center",
                px: { xs: 1.5, sm: 2 },
                borderBottom: "1px solid #e2e8f0",
                zIndex: 1100,
            }}>
                <Typography variant="h6" sx={{
                    fontWeight: 800, color: "#1e293b", flex: 1,
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                }}>
                    Campus Quest
                </Typography>
                <Stack direction="row" spacing={0.5}>
                    <IconButton size="small" onClick={() => router.push("/info")}>
                        <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => router.push("/trails")}>
                        <MapOutlinedIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </Box>

            {/* ── MAP ── */}
            <Box sx={{ flex: 1, position: "relative", minHeight: 0 }}>
                <MapView
                    viewState={viewState}
                    onMove={evt => setViewState(evt.viewState)}
                    onMapLoad={map => (mapRef.current = map)}
                    navTarget={navTarget}
                    isNavigating={isNavigating}
                    onTrailSaved={fetchTrails}
                />

                {/* Navigation HUD — replaces the header area when navigating */}
                {isNavigating && navTarget && (
                    <Box sx={{
                        position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
                        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                        px: 2.5, py: 1.5,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
                    }}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            {/* animated teal pulse indicator */}
                            <Box sx={{
                                width: 10, height: 10, borderRadius: "50%",
                                bgcolor: "#1BA39C",
                                boxShadow: "0 0 0 3px rgba(27,163,156,0.3)",
                                animation: "hudPulse 1.6s ease-in-out infinite",
                                flexShrink: 0,
                            }} />
                            <Box>
                                <Typography sx={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                    Navigating to
                                </Typography>
                                <Typography sx={{ fontSize: 16, color: "#f1f5f9", fontWeight: 800, lineHeight: 1.2 }}>
                                    {navTarget.name}
                                </Typography>
                            </Box>
                        </Stack>
                        <IconButton
                            onClick={handleExitNavigation}
                            size="small"
                            sx={{
                                bgcolor: "rgba(255,255,255,0.08)",
                                border: "1px solid rgba(255,255,255,0.15)",
                                color: "#f1f5f9", borderRadius: 2,
                                px: 1.5, gap: 0.5,
                                "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
                            }}
                        >
                            <CloseIcon fontSize="small" />
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>Exit</Typography>
                        </IconButton>
                    </Box>
                )}

                {/* Sidebar controls */}
                <Stack spacing={1.5} sx={{
                    position: "absolute",
                    right: { xs: 10, sm: 16 },
                    top: { xs: 12, sm: 16 },
                    zIndex: 10,
                }}>
                    <SideButton><LayersIcon fontSize="small" /></SideButton>
                    <SideButton><TerrainIcon fontSize="small" /></SideButton>
                    <SideButton onClick={handleToggle3D} active={viewState.pitch > 0}>
                        <Typography sx={{ fontWeight: 800, fontSize: "0.7rem" }}>3D</Typography>
                    </SideButton>
                    <Box sx={{ height: 4 }} />
                    <SideButton onClick={handleZoomIn}><AddIcon fontSize="small" /></SideButton>
                    <SideButton onClick={handleZoomOut}><RemoveIcon fontSize="small" /></SideButton>
                    <SideButton onClick={handleRecenter}><MyLocationIcon fontSize="small" /></SideButton>
                </Stack>

                {/* Navigation Bottom Card — slides up when a target is selected */}
                {navTarget && !isNavigating && (
                    <Box sx={{
                        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 15,
                        bgcolor: "#fff",
                        borderRadius: "20px 20px 0 0",
                        boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
                        px: { xs: 2.5, sm: 3 },
                        pt: 1,
                        pb: { xs: "max(24px, env(safe-area-inset-bottom))", sm: "28px" },
                        animation: "slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)",
                    }}>
                        {/* drag handle */}
                        <Box sx={{ width: 40, height: 4, bgcolor: "#e2e8f0", borderRadius: 99, mx: "auto", mb: 2.5 }} />

                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                            <Box>
                                <Typography sx={{
                                    fontSize: 11, fontWeight: 700, color: "#1BA39C",
                                    letterSpacing: "0.08em", textTransform: "uppercase", mb: 0.5,
                                }}>
                                    📍 {navTarget.id}
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a", lineHeight: 1.2 }}>
                                    {navTarget.name}
                                </Typography>
                            </Box>
                            <IconButton
                                size="small"
                                onClick={() => setNavTarget(null)}
                                sx={{ bgcolor: "#f1f5f9", ml: 1.5, flexShrink: 0 }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Stack>

                        <Typography sx={{ fontSize: 14, color: "#475569", lineHeight: 1.7, mb: 2.5 }}>
                            {navTarget.description.length > 90
                                ? navTarget.description.slice(0, 90) + "…"
                                : navTarget.description}
                        </Typography>

                        <Stack direction="row" spacing={1.5}>
                            {/* View Details */}
                            <Box
                                onClick={() => router.push(`/location/${navTarget.id}`)}
                                sx={{
                                    flex: 1, py: 1.75, borderRadius: "12px",
                                    border: "1.5px solid #e2e8f0", bgcolor: "#fff",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#0f172a",
                                    "&:hover": { bgcolor: "#f8fafc" },
                                    transition: "background 0.15s",
                                }}
                            >
                                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>View Details</Typography>
                            </Box>

                            {/* Navigate */}
                            <Box
                                onClick={() => setIsNavigating(true)}
                                sx={{
                                    flex: 2, py: 1.75, borderRadius: "12px",
                                    background: "linear-gradient(135deg, #1BA39C 0%, #15857f 100%)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    gap: 1, cursor: "pointer",
                                    boxShadow: "0 4px 16px rgba(27,163,156,0.4)",
                                    "&:hover": { opacity: 0.93 },
                                    transition: "opacity 0.15s",
                                }}
                            >
                                <NavigationIcon sx={{ color: "#fff", fontSize: 18 }} />
                                <Typography sx={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>Navigate</Typography>
                            </Box>
                        </Stack>
                    </Box>
                )}
            </Box>

            {/* ── BOTTOM BAR — hidden when navigating to clear screen real estate ── */}
            {!isNavigating && (
                <Box sx={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: { xs: 2, sm: 3 },
                    pt: 1.5,
                    pb: { xs: "max(16px, env(safe-area-inset-bottom))", sm: "20px" },
                    bgcolor: "rgba(241,245,249,0.98)",
                    borderTop: "1px solid #e2e8f0",
                    zIndex: 1100,
                }}>
                    <Paper elevation={2} sx={{
                        flex: 1, minWidth: 0,
                        borderRadius: "14px",
                        display: "flex", alignItems: "center",
                        px: 2,
                        height: { xs: 50, sm: 54 },
                        cursor: "pointer",
                        bgcolor: "white",
                        border: "1px solid #e2e8f0",
                    }} onClick={() => setSearchOpen(true)}>
                        <SearchIcon sx={{ color: "#94a3b8", mr: 1, flexShrink: 0 }} />
                        <Typography noWrap sx={{
                            color: "#94a3b8", flex: 1,
                            fontSize: { xs: "0.85rem", sm: "0.95rem" },
                        }}>
                            Search TU Blanchardstown...
                        </Typography>
                    </Paper>

                    <IconButton onClick={() => router.push("/scan")} sx={{
                        bgcolor: "#1BA39C", color: "#fff",
                        width: { xs: 50, sm: 54 },
                        height: { xs: 50, sm: 54 },
                        borderRadius: "14px",
                        flexShrink: 0,
                        boxShadow: "0 4px 14px rgba(27,163,156,0.4)",
                        "&:hover": { bgcolor: "#16867f" },
                    }}>
                        <QrCodeScannerIcon />
                    </IconButton>
                </Box>
            )}

            {/* ── SEARCH DRAWER ── */}
            <Drawer
                anchor="bottom"
                open={searchOpen}
                onClose={() => { setSearchOpen(false); setQuery(""); }}
                PaperProps={{ sx: {
                    borderRadius: "24px 24px 0 0",
                    height: "80dvh",
                    pb: "env(safe-area-inset-bottom)",
                }}}
            >
                <Box sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>Locations</Typography>
                        <IconButton onClick={() => { setSearchOpen(false); setQuery(""); }}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>

                    <TextField
                        fullWidth autoFocus
                        placeholder="Search by name or room code..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        variant="outlined"
                        sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: "12px", bgcolor: "#f1f5f9" } }}
                    />

                    <List sx={{ flex: 1, overflowY: "auto" }}>
                        {filtered.map(loc => (
                            <ListItem
                                key={loc.id}
                                onClick={() => handleSelectLocation(loc)}
                                sx={{
                                    mb: 1.5, borderRadius: "16px",
                                    border: "1px solid #f1f5f9",
                                    cursor: "pointer",
                                    "&:hover": { bgcolor: "#f8fafc" },
                                }}
                            >
                                <ListItemText
                                    primary={<Typography sx={{ fontWeight: 700 }}>{loc.name}</Typography>}
                                    secondary={loc.id}
                                />
                                <NavigationIcon sx={{ color: "#1BA39C" }} />
                            </ListItem>
                        ))}
                    </List>

                    {/* ── Campus Trails (live from S3) ── */}
                    <Box sx={{ mt: 2, flexShrink: 0 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                            <Typography sx={{ fontWeight: 800, fontSize: 16, color: "#1e293b" }}>
                                Campus Trails
                            </Typography>
                            <Typography
                                onClick={fetchTrails}
                                sx={{
                                    fontSize: 12, color: "#1BA39C", fontWeight: 700,
                                    cursor: "pointer", "&:hover": { opacity: 0.7 },
                                }}
                            >
                                ↻ Refresh
                            </Typography>
                        </Stack>

                        {trailsLoading ? (
                            <Typography sx={{ fontSize: 13, color: "#94a3b8", textAlign: "center", py: 2 }}>
                                Loading trails…
                            </Typography>
                        ) : trails.length === 0 ? (
                            <Typography sx={{ fontSize: 13, color: "#94a3b8", textAlign: "center", py: 2 }}>
                                No trails saved yet. Use the Trail Designer to record one.
                            </Typography>
                        ) : (
                            <List disablePadding sx={{ maxHeight: 240, overflowY: "auto" }}>
                                {trails.map(trail => (
                                    <ListItem key={trail.id} disablePadding sx={{ mb: 1 }}>
                                        <Box sx={{
                                            width: "100%",
                                            p: 1.5,
                                            borderRadius: "14px",
                                            border: "1.5px solid #e2e8f0",
                                            bgcolor: "#fff",
                                            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                                        }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                                                    {trail.name}
                                                </Typography>
                                                {/* Teal accent chip — point count */}
                                                <Box sx={{
                                                    bgcolor: "#f0fdfa",
                                                    color: "#1BA39C",
                                                    border: "1px solid #99f6e4",
                                                    borderRadius: "20px",
                                                    px: 1.2, py: 0.3,
                                                    fontSize: 11, fontWeight: 700,
                                                    whiteSpace: "nowrap",
                                                }}>
                                                    {trail.points?.length ?? 0} pts
                                                </Box>
                                            </Stack>
                                            {trail.description ? (
                                                <Typography sx={{ fontSize: 12, color: "#64748b", mt: 0.5, lineHeight: 1.5 }}>
                                                    {trail.description}
                                                </Typography>
                                            ) : null}
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>
                </Box>
            </Drawer>

            {/* Keyframe animations */}
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