"use client";
// Mobile-only bottom navigation bar with scan, search, navigate, recenter, and 3D buttons.

import { Box, Tooltip } from "@mui/material";
import { useRouter } from "next/navigation";
import SearchIcon from "@mui/icons-material/Search";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import DirectionsIcon from "@mui/icons-material/Directions";

const PURPLE = "#7C3AED";

// single pressable nav button with an icon, label, and active highlight
function NavBtn({ icon, label, onClick, active, tooltip }) {
    return (
        <Tooltip title={tooltip} placement="top" arrow>
            <Box
                onClick={onClick}
                sx={{
                    flex: 1,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    gap: "3px",
                    py: 1,
                    cursor: "pointer",
                    color: active ? PURPLE : "rgba(255,255,255,0.55)",
                    transition: "color 0.15s",
                    "&:active": { opacity: 0.7 },
                    userSelect: "none",
                }}
            >
                <Box sx={{
                    width: 42, height: 42,
                    borderRadius: "12px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    bgcolor: active ? "rgba(124,58,237,0.18)" : "rgba(255,255,255,0.05)",
                    border: active ? `1px solid rgba(124,58,237,0.45)` : "1px solid rgba(255,255,255,0.08)",
                    transition: "all 0.15s",
                    boxShadow: active ? `0 2px 12px rgba(124,58,237,0.35)` : "none",
                }}>
                    {icon}
                </Box>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.04em", lineHeight: 1 }}>
                    {label}
                </span>
            </Box>
        </Tooltip>
    );
}

export default function BottomBar({
    onSearchClick, onToggle3D, onRecenter, onNavigateClick,
    gpsLocation, pitch,
}) {
    const router = useRouter();

    return (
        <Box sx={{
            flexShrink: 0,
            display: { xs: "flex", sm: "none" },
            alignItems: "center",
            px: 1,
            pt: 0.5,
            pb: "max(10px, env(safe-area-inset-bottom))",
            background: "rgba(10,18,36,0.95)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            zIndex: 1100,
        }}>
            <NavBtn
                icon={<QrCodeScannerIcon sx={{ fontSize: 20 }} />}
                label="Scan"
                onClick={() => router.push("/scan")}
                tooltip="Scan QR code"
            />
            <NavBtn
                icon={<SearchIcon sx={{ fontSize: 20 }} />}
                label="Search"
                onClick={onSearchClick}
                tooltip="Search locations"
            />
            <NavBtn
                icon={<DirectionsIcon sx={{ fontSize: 20 }} />}
                label="Navigate"
                onClick={onNavigateClick}
                tooltip="Route A to B"
            />
            <NavBtn
                icon={<MyLocationIcon sx={{ fontSize: 20 }} />}
                label="Me"
                onClick={onRecenter}
                active={!!gpsLocation}
                tooltip={gpsLocation ? "Go to my location" : "Recenter on campus"}
            />
            <NavBtn
                icon={<ViewInArIcon sx={{ fontSize: 20 }} />}
                label="3D"
                onClick={onToggle3D}
                active={pitch > 0}
                tooltip={pitch > 0 ? "Switch to 2D" : "Switch to 3D"}
            />
        </Box>
    );
}
