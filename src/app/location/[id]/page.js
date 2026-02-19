"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Box, Typography, Button, IconButton, Chip,
    Stack, Divider, Container, Skeleton, Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AccessibleIcon from '@mui/icons-material/Accessible';

// Import your original locations data
import { locations } from "../../data/locations";

export default function LocationDetails() {
    const router = useRouter();
    const { id } = useParams();
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // FIX: Convert both IDs to UpperCase to ensure a match regardless of typing
        const found = locations.find(
            (loc) => loc.id.toUpperCase() === id?.toUpperCase()
        );

        setLocation(found);
        setLoading(false);
    }, [id]);

    if (loading) {
        return (
            <Container sx={{ pt: 10 }}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4 }} />
            </Container>
        );
    }

    // This is what you're seeing currently
    if (!location) {
        return (
            <Box sx={{
                height: '100vh', display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', gap: 2
            }}>
                <Typography variant="h5" fontWeight={700}>Location Not Found</Typography>
                <Button
                    variant="contained"
                    onClick={() => router.push('/')}
                    sx={{ bgcolor: '#1BA39C' }}
                >
                    Back to Map
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
            {/* Header Image */}
            <Box sx={{
                height: 280, width: '100%',
                backgroundImage: `url(${location.image})`,
                backgroundSize: 'cover', backgroundPosition: 'center'
            }}>
                <IconButton
                    onClick={() => router.back()}
                    sx={{ m: 2, bgcolor: 'white', '&:hover': { bgcolor: '#f1f5f9' } }}
                >
                    <ArrowBackIcon />
                </IconButton>
            </Box>

            <Container sx={{ mt: -5, pb: 5 }}>
                <Paper sx={{ p: 4, borderRadius: 5, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h4" fontWeight={900}>{location.name}</Typography>
                        <Chip
                            label={location.id}
                            sx={{ bgcolor: '#1BA39C', color: 'white', fontWeight: 800 }}
                        />
                    </Stack>

                    <Typography sx={{ mt: 3, color: '#475569', lineHeight: 1.7 }}>
                        {location.description}
                    </Typography>

                    <Divider sx={{ my: 4 }} />

                    <Stack direction="row" spacing={2}>
                        <Box sx={{ flex: 1, p: 2, bgcolor: '#f1f5f9', borderRadius: 3 }}>
                            <MeetingRoomIcon sx={{ color: '#64748b', mb: 1 }} />
                            <Typography variant="caption" display="block" color="text.secondary">Floors</Typography>
                            <Typography fontWeight={700}>{location.floors?.join(', ') || 'N/A'}</Typography>
                        </Box>
                        <Box sx={{ flex: 1, p: 2, bgcolor: '#f1f5f9', borderRadius: 3 }}>
                            <AccessibleIcon sx={{ color: '#64748b', mb: 1 }} />
                            <Typography variant="caption" display="block" color="text.secondary">Access</Typography>
                            <Typography fontWeight={700}>Full Access</Typography>
                        </Box>
                    </Stack>

                    <Button
                        fullWidth variant="contained"
                        sx={{ mt: 5, py: 2, borderRadius: 3, bgcolor: '#1BA39C', fontWeight: 700 }}
                        onClick={() => router.push('/')}
                    >
                        Back to Map
                    </Button>
                </Paper>
            </Container>
        </Box>
    );
}