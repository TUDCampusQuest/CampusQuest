"use client";
// Right-side map controls column (zoom, 3D, recenter) and floor switcher buttons.

import { Tooltip, Box } from "@mui/material";
import AddIcon        from "@mui/icons-material/Add";
import RemoveIcon     from "@mui/icons-material/Remove";
import ViewInArIcon   from "@mui/icons-material/ViewInAr";
import MyLocationIcon from "@mui/icons-material/MyLocation";

const PURPLE   = "#7C3AED";
const PURPLE_BG = "rgba(124,58,237,0.12)";

const FLOOR_NAMES = ["2", "1", "G"];

const btnBase = {
    width: 46,
    height: 46,
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(15,23,42,0.82)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    boxShadow: "0 2px 10px rgba(0,0,0,0.22)",
    transition: "all 0.15s ease",
    userSelect: "none",
    color: "#cbd5e1",
};

const btnActive = {
    ...btnBase,
    background: PURPLE,
    border: `1px solid ${PURPLE}`,
    color: "#fff",
    boxShadow: `0 2px 14px rgba(124,58,237,0.45)`,
};

const labelStyle = {
    fontSize: 9,
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: "0.04em",
    color: "inherit",
};

function SqBtn({ icon, label, onClick, active, tooltip }) {
    return (
        <Tooltip title={tooltip} placement="left" arrow>
            <div
                onClick={onClick}
                style={active ? btnActive : btnBase}
                onMouseEnter={e => {
                    if (!active) {
                        e.currentTarget.style.background = PURPLE_BG;
                        e.currentTarget.style.color = PURPLE;
                        e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)";
                    }
                }}
                onMouseLeave={e => {
                    if (!active) {
                        e.currentTarget.style.background = btnBase.background;
                        e.currentTarget.style.color = btnBase.color;
                        e.currentTarget.style.borderColor = btnBase.border.split(" ")[2];
                    }
                }}
            >
                {icon}
                {label && <span style={labelStyle}>{label}</span>}
            </div>
        </Tooltip>
    );
}

function FloorSqBtn({ name, active, onClick }) {
    return (
        <Tooltip title={`Floor ${name}`} placement="left" arrow>
            <div
                onClick={onClick}
                style={active ? btnActive : btnBase}
                onMouseEnter={e => {
                    if (!active) {
                        e.currentTarget.style.background = PURPLE_BG;
                        e.currentTarget.style.color = PURPLE;
                        e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)";
                    }
                }}
                onMouseLeave={e => {
                    if (!active) {
                        e.currentTarget.style.background = btnBase.background;
                        e.currentTarget.style.color = btnBase.color;
                        e.currentTarget.style.borderColor = btnBase.border.split(" ")[2];
                    }
                }}
            >
                <span style={{ fontSize: 14, fontWeight: 800, lineHeight: 1 }}>{name}</span>
            </div>
        </Tooltip>
    );
}

export default function MapSidebar({
    pitch, gpsLocation,
    onZoomIn, onZoomOut, onToggle3D, onRecenter,
    activeFloorName, onFloorNameChange,
}) {
    const handleFloorClick = (name) => {
        onFloorNameChange(activeFloorName === name ? null : name);
    };

    const colStyle = {
        position: "absolute",
        right: 12,
        top: 16,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 10,
    };

    return (
        <>
            <div style={colStyle}>
                <Box sx={{ display: { xs: "none", sm: "block" } }}>
                    <SqBtn
                        icon={<ViewInArIcon sx={{ fontSize: 18 }} />}
                        label="3D"
                        onClick={onToggle3D}
                        active={pitch > 0}
                        tooltip={pitch > 0 ? "Switch to 2D" : "Switch to 3D"}
                    />
                </Box>
                <SqBtn
                    icon={<AddIcon sx={{ fontSize: 18 }} />}
                    label="In"
                    onClick={onZoomIn}
                    tooltip="Zoom in"
                />
                <SqBtn
                    icon={<RemoveIcon sx={{ fontSize: 18 }} />}
                    label="Out"
                    onClick={onZoomOut}
                    tooltip="Zoom out"
                />
                <Box sx={{ display: { xs: "none", sm: "block" } }}>
                    <SqBtn
                        icon={<MyLocationIcon sx={{ fontSize: 18 }} />}
                        label="Me"
                        onClick={onRecenter}
                        active={!!gpsLocation}
                        tooltip={gpsLocation ? "Go to my location" : "Recenter on campus"}
                    />
                </Box>
            </div>

            {/* Floor switcher column — always visible, z-index 22 keeps it above LocationSheet (19) */}
            <div style={{ position: "absolute", right: 12, bottom: 160, display: "flex", flexDirection: "column", gap: 8, zIndex: 22 }}>
                {FLOOR_NAMES.map(name => (
                    <FloorSqBtn
                        key={name}
                        name={name}
                        active={activeFloorName === name}
                        onClick={() => handleFloorClick(name)}
                    />
                ))}
            </div>
        </>
    );
}
