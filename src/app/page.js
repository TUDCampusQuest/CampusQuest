"use client";

import { useState, useEffect } from "react";
import {
    Box, IconButton, TextField, Drawer, List, ListItem, ListItemText,
    Typography, Stack, Paper, InputAdornment
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import LayersIcon from '@mui/icons-material/Layers';
import TerrainIcon from '@mui/icons-material/Terrain';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CloseIcon from '@mui/icons-material/Close';

import { useRouter } from "next/navigation";
import MapView from "./components/MapView";

function SideButton({ children, onClick }) {
    return (
        <Paper
            elevation={2}
            onClick={onClick}
            sx={{
                width: 44, height: 44, display: "flex", justifyContent: "center", alignItems: "center",
                borderRadius: "50%", cursor: "pointer", color: "#475569",
                "&:hover": { bgcolor: "#f8fafc" }
            }}
        >
            {children}
        </Paper>
    );
}

export default function Home() {
    const router = useRouter();
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [isMounted, setIsMounted] = useState(false);
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        setIsMounted(true);

        fetch('/api/locations')
            .then(res => res.json())
            .then(data => {
                const fetchedLocations = Array.isArray(data) ? data : (data?.locations || []);
                setLocations(fetchedLocations);
            })
            .catch(err => console.error("Error loading locations from S3:", err));
    }, []);

    const filtered = locations.filter(l =>
        l.name.toLowerCase().includes(query.toLowerCase()) ||
        l.id.toLowerCase().includes(query.toLowerCase())
    );

    if (!isMounted) return null;

    return (
        <Box sx={{ height: "100vh", width: "100vw", position: "relative", overflow: "hidden", bgcolor: "#f0f0f0" }}>

            <Box sx={{
                position: "absolute", top: 0, left: 0, right: 0, zIndex: 1100,
                height: 70,
                bgcolor: "white", display: "flex", alignItems: "center",
                px: 2, boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
            }}>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    <Box
                        component="img"
                        src="https://campusquesttud.s3.eu-west-1.amazonaws.com/photos/CampusQuestLogo.png"
                        onClick={() => router.push('/')}
                        onError={(e) => { e.target.src = "/logo.png"; }}
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: "10px",
                            objectFit: "contain",
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.05)' },
                            filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))'
                        }}
                        alt="Campus Quest Logo"
                    />
                </Box>

                <Stack direction="row" spacing={1}>
                    <IconButton
                        size="medium"
                        sx={{ color: "#64748b", bgcolor: "#f8fafc" }}
                        onClick={() => router.push("/info")}
                    >
                        <InfoOutlinedIcon />
                    </IconButton>
                    <IconButton size="medium" sx={{ color: "#64748b", bgcolor: "#f8fafc" }}>
                        <MapOutlinedIcon />
                    </IconButton>
                </Stack>
            </Box>

            <MapView />

            <Stack spacing={1.5} sx={{ position: "absolute", right: 16, top: 100, zIndex: 1000 }}>
                <SideButton><LayersIcon /></SideButton>
                <SideButton><TerrainIcon /></SideButton>
                <SideButton><Typography sx={{ fontWeight: 800, fontSize: '0.75rem' }}>3D</Typography></SideButton>
                <Box sx={{ height: 10 }} />
                <SideButton><AddIcon /></SideButton>
                <SideButton><RemoveIcon /></SideButton>
                <SideButton><MyLocationIcon /></SideButton>
            </Stack>

            <Box sx={{
                position: "absolute", bottom: 30, left: "50%",
                transform: "translateX(-50%)", width: "94%", maxWidth: "500px",
                display: "flex", gap: 1, alignItems: "center", zIndex: 1000
            }}>
                <Paper elevation={3} sx={{
                    flex: 1, borderRadius: "12px", display: "flex", alignItems: "center", px: 2, height: 50,
                    cursor: "pointer"
                }} onClick={() => setSearchOpen(true)}>
                    <SearchIcon sx={{ color: "#64748b", mr: 1 }} />
                    <Typography sx={{ color: "#94a3b8", flex: 1 }}>Search Destination</Typography>
                </Paper>

                <IconButton
                    onClick={() => router.push("/scan")}
                    sx={{
                        backgroundColor: "#1BA39C", color: "#fff",
                        width: 50, height: 50, borderRadius: "12px", boxShadow: "0 4px 12px rgba(27,163,156,0.3)",
                        "&:hover": { backgroundColor: "#16867f" },
                    }}
                >
                    <QrCodeScannerIcon />
                </IconButton>
            </Box>

            <Drawer
                anchor="bottom"
                open={searchOpen}
                onClose={() => setSearchOpen(false)}
                PaperProps={{
                    sx: { borderRadius: '24px 24px 0 0', height: '75vh', p: 0, overflow: "hidden" }
                }}
            >
                <Box sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e293b" }}>Find Location</Typography>
                        <IconButton onClick={() => setSearchOpen(false)}><CloseIcon /></IconButton>
                    </Stack>

                    <TextField
                        fullWidth
                        autoFocus
                        placeholder="Type building name or code..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        variant="outlined"
                        InputProps={{
                            endAdornment: query && (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setQuery("")} size="small">
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            mb: 3,
                            "& .MuiOutlinedInput-root": { borderRadius: "12px", bgcolor: "#f1f5f9" },
                            "& .MuiOutlinedInput-notchedOutline": { border: "none" }
                        }}
                    />

                    <List sx={{ flex: 1, overflowY: "auto" }}>
                        {filtered.map((loc) => (
                            <ListItem
                                key={loc.id}
                                onClick={() => {
                                    if (document.activeElement instanceof HTMLElement) {
                                        document.activeElement.blur();
                                    }
                                    setSearchOpen(false);
                                    router.push(`/location/${loc.id}`);
                                }}
                                sx={{
                                    mb: 1.5, borderRadius: "16px", border: "1px solid #f1f5f9",
                                    bgcolor: "white", px: 2, py: 1.5, cursor: "pointer",
                                    "&:hover": { bgcolor: "#f8fafc" }
                                }}
                            >
                                <ListItemText
                                    primary={<Typography sx={{ fontWeight: 700, color: "#334155" }}>{loc.name}</Typography>}
                                    secondary={<Typography variant="body2" sx={{ color: "#64748b" }}>{loc.id} • Campus Building</Typography>}
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