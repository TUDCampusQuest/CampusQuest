"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Box, IconButton, TextField, Drawer, List, ListItem, ListItemText, 
  Typography, Stack, Paper 
} from "@mui/material";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

// Icons
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

import { locations } from "./data/locations"; 

// Dynamic Import to prevent SSR issues with Mapbox
const MapView = dynamic(() => import("./components/MapView"), {
    ssr: false, // This is crucial to stop hydration errors
    loading: () => <Box sx={{ height: "100vh", width: "100vw", bgcolor: "#f1f5f9" }} />
});

// Reusable Side Button Component
function SideButton({ children, onClick, active }) {
  return (
    <Paper 
      elevation={2} 
      onClick={onClick}
      sx={{ 
        width: 44, height: 44, display: "flex", justifyContent: "center", alignItems: "center",
        borderRadius: "50%", cursor: "pointer", 
        color: active ? "#1BA39C" : "#475569",
        transition: "all 0.2s",
        "&:hover": { bgcolor: "#f8fafc" }
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

  // Map State Management for 3D and Zoom
  const [viewState, setViewState] = useState({
    longitude: -6.378240,
    latitude: 53.405292,
    zoom: 16,
    pitch: 0,
    bearing: 0
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Map Controls
  const handleZoomIn = () => setViewState(v => ({ ...v, zoom: Math.min(v.zoom + 1, 20) }));
  const handleZoomOut = () => setViewState(v => ({ ...v, zoom: Math.max(v.zoom - 1, 0) }));
  
  const handleToggle3D = () => {
    setViewState(prev => ({
      ...prev,
      pitch: prev.pitch === 0 ? 60 : 0,
      duration: 1000 // Smooth tilt animation
    }));
  };

  const handleRecenter = () => {
    setViewState(prev => ({
      ...prev,
      longitude: -6.378240,
      latitude: 53.405292,
      zoom: 16,
      pitch: 0,
      duration: 1000
    }));
  };

  const filtered = (Array.isArray(locations) ? locations : []).filter(l => 
    l.name?.toLowerCase().includes(query.toLowerCase()) || 
    l.id?.toLowerCase().includes(query.toLowerCase())
  );

  if (!isMounted) return null;

  return (
    <Box sx={{ height: "100vh", width: "100vw", position: "relative", overflow: "hidden", bgcolor: "#f1f5f9" }}>
      
      {/* HEADER */}
      <Box sx={{ 
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 1100,
        height: 60, bgcolor: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", px: 2, borderBottom: "1px solid #e2e8f0"
      }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e293b", flex: 1 }}>
          Campus Quest
        </Typography>
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={() => router.push("/info")}><InfoOutlinedIcon /></IconButton>
          <IconButton size="small" onClick={() => router.push("/trails")}><MapOutlinedIcon /></IconButton>
        </Stack>
      </Box>

      {/* MAP CONTAINER */}
      <Box sx={{ position: "absolute", inset: 0, zIndex: 1 }}>
        <MapView 
          viewState={viewState} 
          onMove={evt => setViewState(evt.viewState)}
          onMapLoad={(map) => (mapRef.current = map)} 
        />
      </Box>

      {/* SIDEBAR UI */}
      <Stack spacing={1.5} sx={{ position: "absolute", right: 16, top: 100, zIndex: 1000 }}>
        <SideButton><LayersIcon /></SideButton>
        <SideButton><TerrainIcon /></SideButton>
        <SideButton onClick={handleToggle3D} active={viewState.pitch > 0}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.75rem' }}>3D</Typography>
        </SideButton>
        <Box sx={{ height: 10 }} />
        <SideButton onClick={handleZoomIn}><AddIcon /></SideButton>
        <SideButton onClick={handleZoomOut}><RemoveIcon /></SideButton>
        <SideButton onClick={handleRecenter}><MyLocationIcon /></SideButton>
      </Stack>

      {/* BOTTOM SEARCH TRIGGER */}
      <Box sx={{ 
        position: "absolute", bottom: 30, left: "50%", 
        transform: "translateX(-50%)", width: "90%", maxWidth: "450px",
        display: "flex", gap: 1, zIndex: 1000 
      }}>
        <Paper elevation={4} sx={{ 
          flex: 1, borderRadius: "16px", display: "flex", alignItems: "center", px: 2, height: 54,
          cursor: "pointer", bgcolor: "white"
        }} onClick={() => setSearchOpen(true)}>
          <SearchIcon sx={{ color: "#64748b", mr: 1 }} />
          <Typography sx={{ color: "#94a3b8", flex: 1 }}>Search TU Blanchardstown...</Typography>
        </Paper>

        <IconButton
          onClick={() => router.push("/scan")}
          sx={{
            backgroundColor: "#1BA39C", color: "#fff",
            width: 54, height: 54, borderRadius: "16px",
            "&:hover": { backgroundColor: "#16867f" },
          }}
        >
          <QrCodeScannerIcon />
        </IconButton>
      </Box>

      {/* SEARCH OVERLAY */}
      <Drawer
        anchor="bottom"
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        PaperProps={{ sx: { borderRadius: '24px 24px 0 0', height: '80vh' } }}
      >
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Locations</Typography>
            <IconButton onClick={() => setSearchOpen(false)}><CloseIcon /></IconButton>
          </Stack>

          <TextField
            fullWidth
            autoFocus
            placeholder="Search by name or room code..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            variant="outlined"
            sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: "12px", bgcolor: "#f1f5f9" } }}
          />

          <List sx={{ flex: 1, overflowY: "auto" }}>
            {filtered.map((loc) => (
              <ListItem 
                key={loc.id} 
                onClick={() => router.push(`/location/${loc.id}`)}
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