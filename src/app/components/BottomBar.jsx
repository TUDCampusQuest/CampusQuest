"use client";

import { Box, Paper, IconButton, Typography, Tooltip } from "@mui/material";
import { useRouter } from "next/navigation";
import SearchIcon        from "@mui/icons-material/Search";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";

export default function BottomBar({ onSearchClick }) {
    const router = useRouter();

    return (
        <Box sx={{
            flexShrink: 0,
            display: "flex", alignItems: "center", gap: 1.5,
            px: { xs: 2, sm: 3 },
            pt: 1.5,
            pb: { xs: "max(16px, env(safe-area-inset-bottom))", sm: "20px" },
            bgcolor: "rgba(255,255,255,0.97)",
            borderTop: "1px solid #e2e8f0",
            zIndex: 1100,
        }}>
            {/* Search bar  */}
            <Paper
                elevation={0}
                onClick={onSearchClick}
                sx={{
                    flex: 1, minWidth: 0,
                    borderRadius: "14px",
                    display: "flex", alignItems: "center",
                    px: 2,
                    height: { xs: 50, sm: 54 },
                    cursor: "pointer",
                    bgcolor: "#f8fafc",
                    border: "1.5px solid #e2e8f0",
                    transition: "all 0.15s",
                    "&:hover": { borderColor: "#1BA39C", bgcolor: "#f0fdfa" },
                }}
            >
                <SearchIcon sx={{ color: "#94a3b8", mr: 1.5, flexShrink: 0, fontSize: 20 }} />
                <Typography noWrap sx={{
                    color: "#94a3b8", flex: 1,
                    fontSize: { xs: "0.85rem", sm: "0.9rem" },
                    fontWeight: 500,
                }}>
                    Search buildings & locations...
                </Typography>
            </Paper>

            {/* QR scanner button */}
            <Tooltip title="Scan QR code" placement="top">
                <IconButton
                    onClick={() => router.push("/scan")}
                    sx={{
                        bgcolor: "#1BA39C", color: "#fff",
                        width: { xs: 50, sm: 54 },
                        height: { xs: 50, sm: 54 },
                        borderRadius: "14px", flexShrink: 0,
                        boxShadow: "0 4px 14px rgba(27,163,156,0.4)",
                        "&:hover": {
                            bgcolor: "#15857f",
                            transform: "translateY(-1px)",
                            boxShadow: "0 6px 18px rgba(27,163,156,0.45)",
                        },
                        transition: "all 0.18s",
                    }}
                >
                    <QrCodeScannerIcon />
                </IconButton>
            </Tooltip>
        </Box>
    );
}