"use client";

import { useState, useEffect, useRef } from "react";
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

    const filtered = (Array.isArray(locations) ? locations : []).filter(l =>
        l.name?.toLowerCase().includes(query.toLowerCase()) ||
        l.id?.toLowerCase().includes(query.toLowerCase())
    );

    if (!isMounted) return null;

    return (
        // FIX: Use a flex column layout instead of overflow:hidden + absolute positioning.
        // This guarantees the bottom bar is always visible on mobile regardless of
        // browser chrome height, safe areas, or screen size.
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
                flexShrink: 0,                    // never compress the header
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

            {/* ── MAP (fills remaining space) ── */}
            <Box sx={{ flex: 1, position: "relative", minHeight: 0 }}>
                <MapView
                    viewState={viewState}
                    onMove={evt => setViewState(evt.viewState)}
                    onMapLoad={map => (mapRef.current = map)}
                />

                {/* Sidebar controls — positioned relative to the map box */}
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
            </Box>

            {/* ── BOTTOM BAR (Search + QR) ──
           Using flexShrink: 0 inside a flex column guarantees this is ALWAYS
           visible at the bottom — it cannot be pushed off screen. */}
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
                {/* Search pill */}
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

                {/* QR scan button */}
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

            {/* ── SEARCH DRAWER ── */}
            <Drawer
                anchor="bottom"
                open={searchOpen}
                onClose={() => setSearchOpen(false)}
                PaperProps={{ sx: {
                        borderRadius: "24px 24px 0 0",
                        height: "80dvh",
                        pb: "env(safe-area-inset-bottom)",
                    }}}
            >
                <Box sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>Locations</Typography>
                        <IconButton onClick={() => setSearchOpen(false)}><CloseIcon /></IconButton>
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
                            <ListItem key={loc.id}
                                      onClick={() => { setSearchOpen(false); router.push(`/location/${loc.id}`); }}
                                      sx={{ mb: 1.5, borderRadius: "16px", border: "1px solid #f1f5f9", cursor: "pointer", "&:hover": { bgcolor: "#f8fafc" } }}
                            >
                                <ListItemText
                                    primary={<Typography sx={{ fontWeight: 700 }}>{loc.name}</Typography>}
                                    secondary={loc.id}
                                />
                                <InfoOutlinedIcon sx={{ color: "#1BA39C" }} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
        </Box>
    );
}