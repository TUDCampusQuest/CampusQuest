"use client";
// Top navigation bar with the Campus Quest logo, staff badge, nav/search/info/trails buttons, and dark mode toggle.

import { Box, Stack, Typography, Tooltip } from "@mui/material";
import { useRouter } from "next/navigation";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SearchIcon from "@mui/icons-material/Search";
import DirectionsIcon from "@mui/icons-material/Directions";
import { useTheme } from "../context/ThemeContext";

// pill-shaped header button with icon and optional text label
function HeaderBtn({ icon, label, onClick, tooltip }) {
    return (
        <Tooltip title={tooltip} placement="bottom">
            <Box
                onClick={onClick}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    px: 1.5,
                    py: 0.6,
                    borderRadius: "20px",
                    border: "1px solid var(--border-card)",
                    bgcolor: "var(--btn-ghost-bg)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    "&:hover": {
                        bgcolor: "var(--room-item-hover)",
                        borderColor: "var(--accent-teal)",
                    },
                }}
            >
                {icon}
                {label && (
                    <Typography sx={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--text-secondary)",
                        display: { xs: "none", sm: "block" },
                    }}>
                        {label}
                    </Typography>
                )}
            </Box>
        </Tooltip>
    );
}

// icon button that switches between light and dark mode
function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme();
    return (
        <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"} placement="bottom">
            <Box
                onClick={toggleTheme}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    borderRadius: "12px",
                    border: "1px solid var(--border-card)",
                    bgcolor: "var(--btn-ghost-bg)",
                    cursor: "pointer",
                    fontSize: 16,
                    transition: "all 0.2s",
                    "&:hover": {
                        bgcolor: "var(--accent-purple)",
                        borderColor: "var(--accent-purple)",
                        transform: "scale(1.05)",
                    },
                }}
            >
                {isDark ? "☀️" : "🌙"}
            </Box>
        </Tooltip>
    );
}

export default function AppHeader({ isAdmin, onStaffClick, onSearchClick, onNavigateClick }) {
    const router = useRouter();

    return (
        <Box sx={{
            flexShrink: 0,
            height: { xs: 56, sm: 60 },
            bgcolor: "var(--header-bg)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            px: { xs: 1.5, sm: 2.5 },
            borderBottom: "1px solid var(--header-border)",
            zIndex: 1100,
        }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
                <Box
                    onDoubleClick={onStaffClick}
                    sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        flexShrink: 0,
                        cursor: "default",
                        userSelect: "none",
                        boxShadow: "0 2px 8px rgba(124,58,237,0.4)",
                    }}
                >
                    🧭
                </Box>

                <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, color: "var(--text-primary)", fontSize: { xs: "1rem", sm: "1.15rem" } }}
                >
                    Campus Quest
                </Typography>

                {isAdmin && (
                    <Box
                        onClick={onStaffClick}
                        sx={{
                            px: 1,
                            py: "2px",
                            borderRadius: "6px",
                            bgcolor: "#7C3AED",
                            color: "#fff",
                            fontSize: 10,
                            fontWeight: 800,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            cursor: "pointer",
                            transition: "background 0.15s",
                            "&:hover": { bgcolor: "#dc2626" },
                        }}
                    >
                        Staff — Sign Out
                    </Box>
                )}
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
                <HeaderBtn
                    icon={<DirectionsIcon sx={{ fontSize: 15, color: "var(--accent-teal)" }} />}
                    label="Navigate"
                    tooltip="Route from A to B"
                    onClick={onNavigateClick}
                />

                <Box sx={{ display: { xs: "none", sm: "block" } }}>
                    <HeaderBtn
                        icon={<SearchIcon sx={{ fontSize: 15, color: "var(--text-secondary)" }} />}
                        label="Search"
                        tooltip="Search buildings & rooms"
                        onClick={onSearchClick}
                    />
                </Box>

                <HeaderBtn
                    icon={<InfoOutlinedIcon sx={{ fontSize: 15, color: "var(--text-secondary)" }} />}
                    label="Info"
                    tooltip="App info"
                    onClick={() => router.push("/info")}
                />

                <HeaderBtn
                    icon={<span style={{ fontSize: 13 }}>🗺</span>}
                    label="Trails"
                    tooltip="Campus trails"
                    onClick={() => router.push("/trails")}
                />

                <ThemeToggle />
            </Stack>
        </Box>
    );
}
