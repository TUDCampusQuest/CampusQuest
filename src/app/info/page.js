"use client";

import { useState, useEffect } from "react";
import { Box, Typography, Button, Stack, IconButton } from "@mui/material";
import { useRouter } from "next/navigation";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NearMeIcon from '@mui/icons-material/NearMe';
import SearchIcon from '@mui/icons-material/Search';
import GlassCard from '../components/ui/GlassCard';

const S3 = "https://campusquesttud.s3.eu-west-1.amazonaws.com/photos";

export default function InfoPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const features = [
        {
            title: "Scan QR Codes",
            desc: "Find QR codes at building entrances and information points around campus",
            icon: <QrCodeScannerIcon sx={{ color: "#1BA39C" }} />,
        },
        {
            title: "View Location Info",
            desc: "Get induction information and details about each campus location",
            icon: <InfoOutlinedIcon sx={{ color: "#f59e0b" }} />,
        },
        {
            title: "Get Directions",
            desc: "Follow step-by-step walking directions to your next destination",
            icon: <NearMeIcon sx={{ color: "#ec4899" }} />,
        },
        {
            title: "Search Destinations",
            desc: "Find buildings, services, and points of interest across campus",
            icon: <SearchIcon sx={{ color: "#6366f1" }} />,
        }
    ];

    if (!mounted) return null;

    return (
        <Box sx={{ height: "100dvh", overflowY: "auto", bgcolor: "var(--bg-primary)", p: 3, pb: 22 }}>

            {/* Back Button */}
            <IconButton onClick={() => router.back()} sx={{ mb: 2, color: "var(--text-primary)" }}>
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
                <Typography variant="body2" sx={{ color: "var(--text-secondary)", textAlign: "center" }}>
                    Your guide to navigating TU Dublin<br />Blanchardstown Campus
                </Typography>
            </Stack>

            {/* How it works */}
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: "var(--text-primary)" }}>
                How it works:
            </Typography>

            <Stack spacing={2}>
                {features.map((f, i) => (
                    <GlassCard key={i} style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Box sx={{
                            background: "var(--bg-card)",
                            borderRadius: 12,
                            padding: "10px",
                            width: 48,
                            height: 48,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}>
                            {f.icon}
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--text-primary)" }}>
                                {f.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "var(--text-secondary)", display: "block", lineHeight: 1.3 }}>
                                {f.desc}
                            </Typography>
                        </Box>
                    </GlassCard>
                ))}
            </Stack>

            {/* Bottom Button */}
            <Box sx={{
                position: "fixed", bottom: 0, left: 0, right: 0,
                p: 3,
                background: "var(--header-bg)",
                backdropFilter: "blur(8px)",
                borderTop: "1px solid var(--header-border)",
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
