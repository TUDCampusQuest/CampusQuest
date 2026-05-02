"use client";

import { Box, Paper, Tooltip, Typography } from "@mui/material";
import AddIcon        from "@mui/icons-material/Add";
import RemoveIcon     from "@mui/icons-material/Remove";
import ViewInArIcon   from "@mui/icons-material/ViewInAr";
import MyLocationIcon from "@mui/icons-material/MyLocation";

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
                <Typography sx={{
                    fontSize: 9, fontWeight: 700,
                    lineHeight: 1, letterSpacing: "0.03em", color: "inherit",
                }}>
                    {label}
                </Typography>
            </Box>
        </Tooltip>
    );
}

function SideDivider() {
    return <Box sx={{ height: "1px", bgcolor: "#f1f5f9", mx: "8px" }} />;
}

function FloorBtn({ name, active, onClick }) {
    return (
        <Tooltip title={`Floor ${name}`} placement="left" arrow>
            <Box
                onClick={onClick}
                sx={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    py: "8px", px: "6px",
                    cursor: "pointer",
                    color: active ? "#fff" : "#64748b",
                    bgcolor: active ? "#1BA39C" : "transparent",
                    borderRadius: "10px",
                    fontWeight: 800,
                    fontSize: "13px",
                    lineHeight: 1,
                    transition: "all 0.16s",
                    "&:hover": { bgcolor: active ? "#15857f" : "rgba(27,163,156,0.1)", color: active ? "#fff" : "#1BA39C" },
                    userSelect: "none",
                    minHeight: "34px",
                }}
            >
                {name}
            </Box>
        </Tooltip>
    );
}

export default function MapSidebar({
    pitch, gpsLocation,
    onZoomIn, onZoomOut, onToggle3D, onRecenter,
    activeBuilding, activeFloorId, onFloorChange,
}) {
    const floors = activeBuilding
        ? [...activeBuilding.floors].sort((a, b) => b.z - a.z)
        : [];

    return (
        <Paper
            elevation={3}
            sx={{
                position: "absolute",
                right: { xs: 10, sm: 14 },
                top:   { xs: 12, sm: 16 },
                zIndex: 10,
                borderRadius: "14px",
                overflow: "hidden",
                border: "1px solid #e2e8f0",
                width: 52,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
        >
            <SideBtn
                icon={<ViewInArIcon sx={{ fontSize: 18 }} />}
                label="3D"
                onClick={onToggle3D}
                active={pitch > 0}
                tooltip={pitch > 0 ? "Switch to 2D" : "Switch to 3D"}
            />
            <SideDivider />
            <SideBtn
                icon={<AddIcon sx={{ fontSize: 18 }} />}
                label="In"
                onClick={onZoomIn}
                tooltip="Zoom in"
            />
            <SideBtn
                icon={<RemoveIcon sx={{ fontSize: 18 }} />}
                label="Out"
                onClick={onZoomOut}
                tooltip="Zoom out"
            />
            <SideDivider />
            <SideBtn
                icon={<MyLocationIcon sx={{ fontSize: 18 }} />}
                label="Me"
                onClick={onRecenter}
                active={!!gpsLocation}
                tooltip={gpsLocation ? "Go to my location" : "Recenter on campus"}
            />

            {floors.length > 0 && (
                <>
                    <SideDivider />
                    {floors.map(f => (
                        <FloorBtn
                            key={f.floorId}
                            name={f.name}
                            active={f.floorId === activeFloorId}
                            onClick={() => onFloorChange(f.floorId)}
                        />
                    ))}
                </>
            )}
        </Paper>
    );
}
