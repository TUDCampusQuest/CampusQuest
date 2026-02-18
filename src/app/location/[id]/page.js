"use client";

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
}