'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    AppBar, Toolbar, Box, Container, Typography, Button,
    Card, Stack, Skeleton, Chip, Alert
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function TrailCard({ trail }) {
    return (
        <Card
            sx={{
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                width: '100%',
                maxWidth: 400,
                bgcolor: 'white',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': { transform: 'translateY(-5px)' }
            }}
        >
            <Box
                sx={{
                    height: 180,
                    position: 'relative',
                    backgroundImage: `url(${trail.headerImageUrl || 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <Box sx={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.6))'
                }} />
                <Chip
                    label="Active Trail"
                    size="small"
                    sx={{
                        position: 'absolute', top: 16, left: 16,
                        bgcolor: '#1BA39C', color: 'white', fontWeight: 700
                    }}
                />
            </Box>

            <Box sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={800} sx={{ color: '#1e293b' }}>
                    {trail.title || trail.name}
                </Typography>

                <Typography sx={{ mt: 1, color: '#64748b', fontSize: 14, minHeight: 42 }}>
                    {trail.desc || trail.description || 'No description available.'}
                </Typography>

                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2, mb: 3 }}>
                    <AccessTimeIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                    <Typography fontWeight={700} sx={{ fontSize: 14, color: '#475569' }}>
                        {trail.duration || 'Self-paced'}
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: '#94a3b8' }}>• Walking</Typography>
                </Stack>

                <Button
                    variant="contained"
                    fullWidth
                    component={Link}
                    href={`/?trail=${encodeURIComponent(trail.pathKey || trail.id)}`}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                        borderRadius: 2,
                        py: 1.2,
                        bgcolor: '#4F46E5',
                        textTransform: 'none',
                        fontWeight: 700,
                        '&:hover': { bgcolor: '#4338CA' }
                    }}
                >
                    Start Exploration
                </Button>
            </Box>
        </Card>
    );
}

export default function TrailsPage() {
    const [mounted, setMounted] = useState(false);
    const [trails, setTrails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        const fetchTrails = async () => {
            try {
                const res = await fetch('/api/trails', { cache: 'no-store' });

                if (!res.ok) {
                    // API responded but with an error status (404, 500, etc.)
                    setFetchError(`Could not load trails (server returned ${res.status}). Check your S3 connection.`);
                    setTrails([]);
                    return;
                }

                const data = await res.json();

                // ✅ FIX: Guard against non-array responses (null, object, etc.)
                // The API can return null if S3 is unreachable, or an object if
                // the JSON in S3 is not a top-level array.
                if (Array.isArray(data)) {
                    setTrails(data);
                } else if (data && typeof data === 'object' && !data.error) {
                    // Handle case where S3 stores trails as a keyed object
                    // e.g. { "Sports Trail": [...], "Technology Trail": [...] }
                    const converted = Object.entries(data).map(([name, points]) => ({
                        id: name.toLowerCase().replace(/\s+/g, '-'),
                        name,
                        points: Array.isArray(points) ? points : [],
                    }));
                    setTrails(converted);
                } else {
                    // Null, error object, or unexpected shape
                    setFetchError(data?.error || 'Trails data is unavailable. Check your S3 bucket.');
                    setTrails([]);
                }
            } catch (e) {
                console.error("Failed to load trails:", e);
                setFetchError("Network error — could not reach the trails API.");
                setTrails([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTrails();
    }, []);

    if (!mounted) return null;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid #e2e8f0',
                    color: '#1e293b'
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                        Campus Quest
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button component={Link} href="/" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'none' }}>
                            Map
                        </Button>
                        <Button
                            component={Link}
                            href="/scan"
                            variant="contained"
                            size="small"
                            sx={{ bgcolor: '#1BA39C', fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
                        >
                            Scan QR
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ pt: 6, pb: 2 }}>
                <Typography variant="h4" fontWeight={900} sx={{ color: '#1e293b', mb: 1 }}>
                    Campus Trails
                </Typography>
                <Typography sx={{ color: '#64748b', mb: 4 }}>
                    Select a curated path to explore the TU Blanchardstown facilities.
                </Typography>

                {/* ✅ FIX: Show a clear error message instead of crashing */}
                {fetchError && (
                    <Alert severity="warning" sx={{ mb: 4, borderRadius: 3 }}>
                        {fetchError}
                    </Alert>
                )}

                {loading ? (
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                        <Skeleton variant="rectangular" width={400} height={400} sx={{ borderRadius: 4 }} />
                        <Skeleton variant="rectangular" width={400} height={400} sx={{ borderRadius: 4 }} />
                    </Stack>
                ) : trails.length === 0 && !fetchError ? (
                    <Typography sx={{ color: '#94a3b8', mt: 4 }}>
                        No trails found. Add one using the Trail Designer on the map.
                    </Typography>
                ) : (
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} flexWrap="wrap">
                        {trails.map((trail, i) => (
                            <TrailCard key={trail._id || trail.id || i} trail={trail} />
                        ))}
                    </Stack>
                )}
            </Container>
        </Box>
    );
}