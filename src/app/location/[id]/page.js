"use client";

<<<<<<< HEAD
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Box, Typography, Button, IconButton, Chip, 
  Stack, Divider, Container, Paper 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessibleIcon from '@mui/icons-material/Accessible';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import NavigationIcon from '@mui/icons-material/Navigation';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

// DATA PASTE: We are putting this here so the build error GOES AWAY.
const locations = [
  {
    id: "FBL",
    name: "F Block",
    description: "Lecture halls, classrooms, library, security, toilets.",
    floor: 0,
    accessibility: "Lift",
    indoorInstructions: "Library is straight ahead; security is at the main desk.",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000", // Placeholder
    lat: 53.406,
    lng: -6.379
  }
  // Add your other buildings here if you have them
];

export default function LocationDetails() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const location = locations.find(loc => loc.id.toUpperCase() === id?.toUpperCase());

  if (!location) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC' }}>
        <Typography variant="h6" sx={{ color: '#1e293b', mb: 2, fontWeight: 700 }}>Location Not Found</Typography>
        <Button variant="contained" onClick={() => router.push('/')} sx={{ bgcolor: '#1BA39C' }}>Back to Map</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 12 }}>
      <Box sx={{ width: '100%', height: '280px', backgroundImage: `url(${location.image})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.2)' }} />
        <IconButton onClick={() => router.back()} sx={{ position: 'absolute', top: 20, left: 20, bgcolor: 'white' }}><ArrowBackIcon /></IconButton>
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
              <Box sx={{ flex: 1, p: 2, bgcolor: '#f8fafc', borderRadius: '16px' }}>
                <MeetingRoomIcon sx={{ color: '#64748b' }} />
                <Typography sx={{ fontWeight: 800 }}>{location.floor === 0 ? 'Ground' : `Level ${location.floor}`}</Typography>
              </Box>
              <Box sx={{ flex: 1, p: 2, bgcolor: '#f8fafc', borderRadius: '16px' }}>
                <AccessibleIcon sx={{ color: '#64748b' }} />
                <Typography sx={{ fontWeight: 800 }}>{location.accessibility}</Typography>
              </Box>
            </Stack>
            <Box sx={{ bgcolor: '#ecfeff', p: 2, borderRadius: '16px', borderLeft: '4px solid #06b6d4' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0891b2' }}>Indoor Guidance</Typography>
              <Typography variant="body2" sx={{ color: '#164e63' }}>{location.indoorInstructions}</Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
=======
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
                // Fetching your locations.json via your API route
                const res = await fetch('/api/locations');
                const data = await res.json();

                // Matching the building ID from the URL (e.g., /location/FBL)
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

    // Fallback logic:
    // 1. Tries the 'image' field from your S3 JSON
    // 2. Tries a local fallback if S3 is empty
    const displayImage = location.image || '/logo.png';

    return (
        <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 12 }}>
            <Box sx={{
                width: '100%',
                height: '30vh',
                backgroundImage: `url(${displayImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                boxShadow: 'inset 0 -50px 50px -20px rgba(0,0,0,0.3)'
            }}>
                <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.1)' }} />
                <IconButton
                    onClick={() => router.back()}
                    sx={{
                        position: 'absolute',
                        top: 20,
                        left: 20,
                        bgcolor: 'white',
                        boxShadow: 2,
                        '&:hover': { bgcolor: '#f1f5f9' }
                    }}
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
                                <Typography sx={{ fontWeight: 800 }}>
                                    {location.floor === 0 || location.floor === "Ground" ? 'Ground' : `Level ${location.floor}`}
                                </Typography>
                            </Box>
                            <Box sx={{ flex: 1, p: 2, bgcolor: '#f8fafc', borderRadius: '16px', textAlign: 'center' }}>
                                <AccessibleIcon sx={{ color: '#64748b', mb: 0.5 }} />
                                <Typography variant="caption" display="block" color="textSecondary">ACCESS</Typography>
                                <Typography sx={{ fontWeight: 800 }}>{location.accessibility || 'Standard'}</Typography>
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
                            sx={{
                                bgcolor: '#1BA39C',
                                py: 2,
                                borderRadius: '16px',
                                fontWeight: 800,
                                '&:hover': { bgcolor: '#15807a' }
                            }}
                        >
                            Start Navigation
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
>>>>>>> cea9bbdf4e0eaf2ac994fdc38dc0dd30b256b790
}