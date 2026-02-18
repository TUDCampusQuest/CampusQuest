'use client';

<<<<<<< HEAD
import { Card, Box, Typography, Chip, Stack, Divider } from '@mui/material';
=======
import {Card, Box, Typography, Chip, Stack, Divider,} from '@mui/material';
>>>>>>> cea9bbdf4e0eaf2ac994fdc38dc0dd30b256b790
import MapView from './MapView';

const TRAILS = ['Technology Trail', 'Sports Trail'];

export default function MapCard({
  selectedTrail,
  setSelectedTrail,
}) {
  const handleToggleTrail = (trail) => {
    setSelectedTrail((prev) => (prev === trail ? null : trail));
  };

  return (
<<<<<<< HEAD
    <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 4, bgcolor: 'background.paper' }}>
      {/* Dynamic Gradient Header */}
=======
    <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 4 }}>
>>>>>>> cea9bbdf4e0eaf2ac994fdc38dc0dd30b256b790
      <Box
        sx={{
          px: 3,
          py: 2.5,
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h6" fontWeight="800" sx={{ letterSpacing: '-0.5px' }}>
          Campus Quest
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mb: 1.5 }}>
          TU Dublin Blanchardstown
        </Typography>

<<<<<<< HEAD
        {/* Trail Selector Chips */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {TRAILS.map((trail) => {
            const isActive = selectedTrail === trail;
            return (
              <Chip
                key={trail}
                label={trail}
                clickable
                onClick={() => handleToggleTrail(trail)}
                size="small"
                sx={{
                  bgcolor: isActive ? 'white' : 'rgba(255, 255, 255, 0.2)',
                  color: isActive ? '#4F46E5' : 'white',
                  fontWeight: isActive ? 700 : 500,
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    bgcolor: isActive ? 'white' : 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              />
            );
          })}
        </Stack>
      </Box>

      {/* Mapbox Canvas Container */}
      <Box sx={{ height: { xs: 400, md: 550 }, position: 'relative' }}>
        <MapView selectedTrail={selectedTrail} />
      </Box>

      {/* Legend / Info Footer */}
=======
        <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
          {trails.map((trail) => (
            <Chip
              key={trail}
              label={trail}
              clickable
              onClick={() => toggleTrail(trail)}
              size="small"
              sx={{
                bgcolor:
                  selectedTrail === trail
                    ? 'white'
                    : 'rgba(255,255,255,0.85)',
                color: '#4F46E5',
                fontWeight:
                  selectedTrail === trail ? 700 : 500,
              }}
            />
          ))}
        </Stack>
      </Box>

      <Box sx={{ height: { xs: 350, md: 500 } }}>
        <MapView
          selectedTrail={selectedTrail}
          onSelectLocation={onSelectLocation}
        />
      </Box>

>>>>>>> cea9bbdf4e0eaf2ac994fdc38dc0dd30b256b790
      <Divider />
      <Box sx={{ px: 3, py: 2, bgcolor: '#f8fafc' }}>
        <Typography variant="subtitle2" fontWeight="700" color="text.primary" gutterBottom>
          Map Details
        </Typography>

        <Stack direction="row" spacing={3}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10b981' }} />
            <Typography variant="caption" color="text.secondary" fontWeight="500">
              Your Location
            </Typography>
          </Stack>
          
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#4F46E5' }} />
            <Typography variant="caption" color="text.secondary" fontWeight="500">
              Trail Waypoints
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}