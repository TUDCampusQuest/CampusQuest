'use client';

import {Card, Box, Typography, Chip, Stack, Divider,} from '@mui/material';
import MapView from './MapView';

const trails = [
  'Technology Trail',
  'Sports Trail',
];

export default function MapCard({
  selectedTrail,
  setSelectedTrail,
  onSelectLocation,
}) {
  const toggleTrail = (trail) => {
    setSelectedTrail((prev) =>
      prev === trail ? null : trail
    );
  };

  return (
    <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 4 }}>
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          background: 'linear-gradient(90deg, #4F46E5, #9333EA)',
          color: 'white',
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          TU Dublin Blanchardstown Campus
        </Typography>

        {/* Trial buttons */}
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

      {/* Map */}
      <Box sx={{ height: { xs: 350, md: 500 } }}>
        <MapView
          selectedTrail={selectedTrail}
          onSelectLocation={onSelectLocation}
        />
      </Box>

      {/* Legend */}
      <Divider />
      <Box sx={{ px: 3, py: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Map Legend
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: '#EF4444',
            }}
          />
          <Typography variant="caption">Trail Stops</Typography>
        </Stack>
      </Box>
    </Card>
  );
}
