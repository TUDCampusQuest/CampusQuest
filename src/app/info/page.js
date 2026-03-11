"use client";

import { useState, useEffect } from "react";
import { Box, Typography, Button, Stack, Paper, IconButton } from "@mui/material";
import { useRouter } from "next/navigation";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NearMeIcon from '@mui/icons-material/NearMe';
import SearchIcon from '@mui/icons-material/Search';

const S3 = "https://campusquesttud.s3.eu-west-1.amazonaws.com/photos";

export default function InfoPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    // Prevents MUI emotion styles from mismatching between server and client
    useEffect(() => { setMounted(true); }, []);

    const features = [
        {
            title: "Scan QR Codes",
            desc: "Find QR codes at building entrances and information points around campus",
            icon: <QrCodeScannerIcon sx={{ color: "#1BA39C" }} />,
            color: "#e6f6f5"
        },
        {
            title: "View Location Info",
            desc: "Get induction information and details about each campus location",
            icon: <InfoOutlinedIcon sx={{ color: "#f59e0b" }} />,
            color: "#fffbeb"
        },
        {
            title: "Get Directions",
            desc: "Follow step-by-step walking directions to your next destination",
            icon: <NearMeIcon sx={{ color: "#ec4899" }} />,
            color: "#fdf2f8"
        },
        {
            title: "Search Destinations",
            desc: "Find buildings, services, and points of interest across campus",
            icon: <SearchIcon sx={{ color: "#6366f1" }} />,
            color: "#eef2ff"
        }
    ];

    if (!mounted) return null;

    return (
        <Box sx={{ minHeight: "100dvh", bgcolor: "#f8fafc", p: 3, pb: 10 }}>

            {/* Back Button */}
            <IconButton onClick={() => router.back()} sx={{ mb: 2 }}>
                <ArrowBackIcon />
            </IconButton>

            {/* Hero Section */}
            <Stack alignItems="center" spacing={1} sx={{ mb: 4 }}>
                <Box
                    component="img"
                    src={`${S3}/CampusQuestLogo.png`}
                    sx={{ maxWidth: 160, width: "100%", mb: 1 }}
                    alt="Campus Quest Logo"
                />
                <Typography variant="body2" sx={{ color: "#64748b", textAlign: "center" }}>
                    Your guide to navigating TU Dublin<br />Blanchardstown Campus
                </Typography>
            </Stack>

            {/* How it works */}
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: "#1e293b" }}>
                How it works:
            </Typography>

            <Stack spacing={2}>
                {features.map((f, i) => (
                    <Paper key={i} elevation={0} sx={{
                        p: 2, borderRadius: 4, display: "flex", alignItems: "center",
                        gap: 2, border: "1px solid #f1f5f9"
                    }}>
                        <Box sx={{
                            width: 48, height: 48, borderRadius: 3, bgcolor: f.color,
                            display: "flex", justifyContent: "center", alignItems: "center",
                            flexShrink: 0,
                        }}>
                            {f.icon}
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1e293b" }}>
                                {f.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#64748b", display: "block", lineHeight: 1.3 }}>
                                {f.desc}
                            </Typography>
                        </Box>
                    </Paper>
                ))}
            </Stack>

            {/* Bottom Button */}
            <Box sx={{
                position: "fixed", bottom: 0, left: 0, right: 0,
                p: 3,
                bgcolor: "rgba(248,250,252,0.95)",
                backdropFilter: "blur(8px)",
                borderTop: "1px solid #e2e8f0",
            }}>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={() => router.push("/")}
                    sx={{
                        bgcolor: "#1BA39C", py: 1.8, borderRadius: 3, fontWeight: 700,
                        textTransform: "none", fontSize: "1rem",
                        "&:hover": { bgcolor: "#16867f" }
                    }}
                >
                    Get Started
                </Button>
                <Typography variant="caption" sx={{ display: "block", textAlign: "center", mt: 1.5, color: "#94a3b8" }}>
                    No account needed — start exploring right away
                </Typography>
            </Box>
        </Box>
    );
}