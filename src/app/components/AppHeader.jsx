"use client";

import { Box, Stack, Typography, Tooltip } from "@mui/material";
import { useRouter } from "next/navigation";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RouteIcon        from "@mui/icons-material/Route";

function HeaderBtn({ icon, label, onClick, tooltip }) {
    return (
        <Tooltip title={tooltip} placement="bottom">
            <Box
                onClick={onClick}
                sx={{
                    display: "flex", alignItems: "center", gap: "5px",
                    px: 1.5, py: 0.6, borderRadius: "20px",
                    border: "1px solid #e2e8f0",
                    bgcolor: "#f8fafc",
                    cursor: "pointer", transition: "all 0.15s",
                    "&:hover": { bgcolor: "#f0fdfa", borderColor: "#1BA39C" },
                }}
            >
                {icon}
                {label && (
                    <Typography sx={{
                        fontSize: 12, fontWeight: 700, color: "#475569",
                        display: { xs: "none", sm: "block" },
                    }}>
                        {label}
                    </Typography>
                )}
            </Box>
        </Tooltip>
    );
}

export default function AppHeader({ isAdmin, onStaffClick }) {
    const router = useRouter();

    return (
        <Box sx={{
            flexShrink: 0,
            height: { xs: 56, sm: 60 },
            bgcolor: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(10px)",
            display: "flex", alignItems: "center",
            px: { xs: 1.5, sm: 2.5 },
            borderBottom: "1px solid #e2e8f0",
            zIndex: 1100,
        }}>
            {/* Logo give access to staff auth */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
                <Box
                    onDoubleClick={onStaffClick}
                    sx={{
                        width: 30, height: 30, borderRadius: "8px",
                        background: "linear-gradient(135deg, #1BA39C 0%, #0e6d68 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 15, flexShrink: 0,
                        cursor: "default", userSelect: "none",
                    }}
                >
                    🧭
                </Box>

                <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, color: "#1e293b", fontSize: { xs: "1rem", sm: "1.15rem" } }}
                >
                    Campus Quest
                </Typography>

                {/* Staff badge for logo */}
                {isAdmin && (
                    <Box
                        onClick={onStaffClick}
                        sx={{
                            px: 1, py: "2px", borderRadius: "6px",
                            bgcolor: "#1BA39C", color: "#fff",
                            fontSize: 10, fontWeight: 800,
                            letterSpacing: "0.08em", textTransform: "uppercase",
                            cursor: "pointer",
                            "&:hover": { bgcolor: "#dc2626" },
                            transition: "background 0.15s",
                        }}
                    >
                        Staff — Sign Out
                    </Box>
                )}
            </Stack>

            {/* Navigation buttons */}
            <Stack direction="row" spacing={1}>
                <HeaderBtn
                    icon={<InfoOutlinedIcon sx={{ fontSize: 15, color: "#64748b" }} />}
                    label="Info"
                    tooltip="App info"
                    onClick={() => router.push("/info")}
                />
                <HeaderBtn
                    icon={<RouteIcon sx={{ fontSize: 15, color: "#64748b" }} />}
                    label="Trails"
                    tooltip="Campus trails"
                    onClick={() => router.push("/trails")}
                />
            </Stack>
        </Box>
    );
}