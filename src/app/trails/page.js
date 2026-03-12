"use client";

import { useState, useEffect, useCallback } from "react";
import { Box, Typography, Stack, IconButton, Chip, CircularProgress, Paper } from "@mui/material";
import { useRouter } from "next/navigation";
import ArrowBackIcon  from "@mui/icons-material/ArrowBack";
import RefreshIcon    from "@mui/icons-material/Refresh";
import RouteIcon      from "@mui/icons-material/Route";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlaceIcon      from "@mui/icons-material/Place";
import MapIcon        from "@mui/icons-material/Map";

export default function TrailsPage() {
    const router = useRouter();
    const [trails, setTrails]           = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);
    const [lastFetched, setLastFetched] = useState(null);

    const fetchTrails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res  = await fetch("/api/trails", { cache: "no-store" });
            if (!res.ok) throw new Error(`Server error ${res.status}`);
            const data = await res.json();
            setTrails(Array.isArray(data) ? data : []);
            setLastFetched(new Date().toLocaleTimeString("en-IE"));
        } catch (err) {
            setError(err.message ?? "Failed to load trails");
            setTrails([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTrails(); }, [fetchTrails]);

    // Navigate to map — useTrailSelector on the home page reads ?trail=id
    // and now also fetches S3 trails, so the line will render correctly
    const handleViewOnMap = (trailId) => {
        router.push(`/?trail=${encodeURIComponent(trailId)}`);
    };

    const estimateDistance = (pts) => {
        if (!pts?.length) return "—";
        const m = pts.length * 8;
        return m >= 1000 ? `~${(m / 1000).toFixed(1)} km` : `~${m} m`;
    };

    return (
        <Box sx={{
            minHeight: "100dvh",
            // Soft baby blue — calm, easy on the eyes
            background: "linear-gradient(160deg, #dbeafe 0%, #e0f2fe 50%, #ede9fe 100%)",
            display: "flex", flexDirection: "column",
        }}>

            {/* ── Header ── */}
            <Box sx={{
                position: "sticky", top: 0, zIndex: 100,
                bgcolor: "rgba(255,255,255,0.88)", backdropFilter: "blur(12px)",
                borderBottom: "1px solid rgba(147,197,253,0.4)",
                px: { xs: 2, sm: 3 }, py: 1.5,
                display: "flex", alignItems: "center", gap: 1.5,
            }}>
                <IconButton onClick={() => router.push("/")} size="small">
                    <ArrowBackIcon fontSize="small" sx={{ color: "#475569" }} />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e293b", flex: 1 }}>
                    Campus Trails
                </Typography>
                {!loading && (
                    <Chip
                        label={`${trails.length} saved`}
                        size="small"
                        sx={{ bgcolor: "#f0fdfa", color: "#1BA39C", fontWeight: 700, border: "1px solid #99f6e4" }}
                    />
                )}
                <IconButton onClick={fetchTrails} size="small" disabled={loading}>
                    <RefreshIcon fontSize="small" sx={{ color: loading ? "#cbd5e1" : "#1BA39C" }} />
                </IconButton>
            </Box>

            {lastFetched && (
                <Typography sx={{ fontSize: 11, color: "#94a3b8", textAlign: "center", pt: 1 }}>
                    Last updated: {lastFetched}
                </Typography>
            )}

            {/* ── Body ── */}
            <Box sx={{ flex: 1, px: { xs: 2, sm: 3 }, py: 2, maxWidth: 640, mx: "auto", width: "100%" }}>

                {/* Loading */}
                {loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                        <CircularProgress sx={{ color: "#1BA39C" }} />
                    </Box>
                )}

                {/* Error */}
                {!loading && error && (
                    <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "#fef2f2", border: "1px solid #fecaca" }}>
                        <Typography sx={{ color: "#dc2626", fontWeight: 700, fontSize: 14 }}>⚠ {error}</Typography>
                        <Typography sx={{ color: "#94a3b8", fontSize: 12, mt: 0.5 }}>
                            Check your AWS S3 connection and try refreshing.
                        </Typography>
                    </Paper>
                )}

                {/* Empty */}
                {!loading && !error && trails.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                        <RouteIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 2 }} />
                        <Typography sx={{ fontWeight: 700, color: "#475569", mb: 1 }}>No trails saved yet</Typography>
                        <Typography sx={{ fontSize: 13, color: "#94a3b8", mb: 3 }}>
                            Open the Trail Designer on the map to record your first trail.
                        </Typography>
                        <Box onClick={() => router.push("/")} sx={{
                            display: "inline-block", px: 3, py: 1.5, borderRadius: 3,
                            bgcolor: "#1BA39C", color: "#fff", fontWeight: 700, fontSize: 14,
                            cursor: "pointer", "&:hover": { bgcolor: "#15857f" },
                        }}>
                            Go to Map
                        </Box>
                    </Box>
                )}

                {/* Trail list */}
                {!loading && !error && trails.length > 0 && trails.map(trail => (
                    <Paper key={trail.id} sx={{
                        p: 2, mb: 1.5, borderRadius: "18px",
                        bgcolor: "rgba(255,255,255,0.82)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(147,197,253,0.35)",
                        boxShadow: "0 2px 12px rgba(96,165,250,0.08)",
                        transition: "box-shadow 0.15s, transform 0.15s",
                        "&:hover": {
                            boxShadow: "0 6px 24px rgba(96,165,250,0.18)",
                            transform: "translateY(-1px)",
                        },
                    }}>
                        {/* Name + pts chip */}
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5 }}>
                            <Typography sx={{ fontWeight: 800, fontSize: 15, color: "#0f172a", flex: 1, mr: 1 }}>
                                {trail.name}
                            </Typography>
                            <Chip
                                label={`${trail.points?.length ?? 0} pts`}
                                size="small"
                                sx={{ bgcolor: "#f0fdfa", color: "#1BA39C", fontWeight: 700, border: "1px solid #99f6e4", fontSize: 11 }}
                            />
                        </Stack>

                        {/* Description */}
                        {trail.description && (
                            <Typography sx={{ fontSize: 13, color: "#64748b", mb: 1.25, lineHeight: 1.5 }}>
                                {trail.description}
                            </Typography>
                        )}

                        {/* Meta + View on Map */}
                        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <PlaceIcon sx={{ fontSize: 13, color: "#94a3b8" }} />
                                    <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>
                                        {estimateDistance(trail.points)}
                                    </Typography>
                                </Stack>
                                {trail.createdAt && (
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <AccessTimeIcon sx={{ fontSize: 13, color: "#94a3b8" }} />
                                        <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>
                                            {new Date(trail.createdAt).toLocaleDateString("en-IE", {
                                                day: "numeric", month: "short", year: "numeric",
                                            })}
                                        </Typography>
                                    </Stack>
                                )}
                                {trail.category && trail.category !== "General" && (
                                    <Chip label={trail.category} size="small" sx={{ fontSize: 10, height: 18 }} />
                                )}
                            </Stack>

                            {/* View on Map — passes trail.id, useTrailSelector now resolves it from S3 */}
                            <Box
                                onClick={() => handleViewOnMap(trail.id)}
                                sx={{
                                    display: "flex", alignItems: "center", gap: 0.75,
                                    px: 1.75, py: 0.7,
                                    borderRadius: "10px",
                                    background: "linear-gradient(135deg, #1BA39C 0%, #15857f 100%)",
                                    color: "#fff",
                                    fontWeight: 700, fontSize: 12,
                                    cursor: "pointer",
                                    boxShadow: "0 2px 8px rgba(27,163,156,0.3)",
                                    transition: "opacity 0.15s",
                                    "&:hover": { opacity: 0.88 },
                                    userSelect: "none",
                                }}
                            >
                                <MapIcon sx={{ fontSize: 14 }} />
                                View on Map
                            </Box>
                        </Stack>
                    </Paper>
                ))}
            </Box>

            {/* ── Footer CTA ── */}
            <Box sx={{
                flexShrink: 0, px: 3, py: 2,
                borderTop: "1px solid rgba(147,197,253,0.3)",
                bgcolor: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(10px)",
                textAlign: "center",
            }}>
                <Box onClick={() => router.push("/")} sx={{
                    display: "inline-flex", alignItems: "center", gap: 1,
                    px: 4, py: 1.5, borderRadius: "12px",
                    background: "linear-gradient(135deg, #1BA39C 0%, #15857f 100%)",
                    color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(27,163,156,0.3)",
                    "&:hover": { opacity: 0.92 },
                }}>
                    <RouteIcon sx={{ fontSize: 18 }} />
                    Open Trail Designer
                </Box>
            </Box>
        </Box>
    );
}