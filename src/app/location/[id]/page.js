"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Box, Typography, Button, IconButton, Chip,
    Stack, Divider, Container, Paper, CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessibleIcon from '@mui/icons-material/Accessible';
import NavigationIcon from '@mui/icons-material/Navigation';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

export default function LocationDetails() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        async function fetchLocation() {
            try {
                const res = await fetch('/api/locations');
                const data = await res.json();
                const found = data.find(loc => loc.id.toUpperCase() === id?.toUpperCase());
                setLocation(found);
            } catch (err) {
                console.error("Failed to load building data:", err);
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchLocation();
    }, [id]);

    if (!mounted) return null;

    if (loading) return (
        <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress sx={{ color: '#1BA39C' }} />
        </Box>
    );

    if (!location) return (
        <Container sx={{ mt: 10, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Building Not Found</Typography>
            <Button variant="contained" onClick={() => router.push('/')} sx={{ bgcolor: '#1BA39C' }}>
                Return to Map
            </Button>
        </Container>
    );

    return (
        <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 12 }}>
            <Box sx={{
                width: '100%', height: '30vh',
                backgroundImage: `url(${location.image || 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000'})`,
                backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative'
            }}>
                <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.1)' }} />
                <IconButton
                    onClick={() => router.back()}
                    sx={{ position: 'absolute', top: 20, left: 20, bgcolor: 'white', '&:hover': { bgcolor: '#f1f5f9' } }}
                >
                    <ArrowBackIcon />
                </IconButton>
            </Box>

            <Container maxWidth="sm" sx={{ mt: -4, position: 'relative', zIndex: 2 }}>
                <Paper elevation={4} sx={{ p: 3, borderRadius: '24px', bgcolor: 'white' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>{location.name}</Typography>
                            <Typography variant="subtitle1" sx={{ color: '#64748b' }}>TU Dublin Blanchardstown</Typography>
                        </Box>
                        <Chip label={location.id} sx={{ bgcolor: '#1BA39C', color: 'white', fontWeight: 800 }} />
                    </Stack>

                    <Stack spacing={3} sx={{ mt: 3 }}>
                        <Box>
                            <Typography variant="overline" sx={{ color: '#1BA39C', fontWeight: 900 }}>About</Typography>
                            <Typography variant="body1" sx={{ color: '#334155' }}>{location.description}</Typography>
                        </Box>

                        <Divider />

                        <Stack direction="row" spacing={2}>
                            <Box sx={{ flex: 1, p: 2, bgcolor: '#f8fafc', borderRadius: '16px', textAlign: 'center' }}>
                                <MeetingRoomIcon sx={{ color: '#64748b', mb: 0.5 }} />
                                <Typography variant="caption" display="block" color="textSecondary">FLOOR</Typography>
                                <Typography sx={{ fontWeight: 800 }}>{location.floor === 0 ? 'Ground' : `Level ${location.floor}`}</Typography>
                            </Box>
                            <Box sx={{ flex: 1, p: 2, bgcolor: '#f8fafc', borderRadius: '16px', textAlign: 'center' }}>
                                <AccessibleIcon sx={{ color: '#64748b', mb: 0.5 }} />
                                <Typography variant="caption" display="block" color="textSecondary">ACCESS</Typography>
                                <Typography sx={{ fontWeight: 800 }}>{location.accessibility}</Typography>
                            </Box>
                        </Stack>

                        <Box sx={{ bgcolor: '#ecfeff', p: 2, borderRadius: '16px', borderLeft: '4px solid #06b6d4' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0891b2' }}>Indoor Guidance</Typography>
                            <Typography variant="body2" sx={{ color: '#164e63' }}>{location.indoorInstructions}</Typography>
                        </Box>

                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<NavigationIcon />}
                            onClick={() => router.push(`/?lat=${location.lat}&lng=${location.lng}`)}
                            sx={{ bgcolor: '#1BA39C', py: 2, borderRadius: '16px', fontWeight: 800, '&:hover': { bgcolor: '#15807a' } }}
                        >
                            Start Navigation
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}