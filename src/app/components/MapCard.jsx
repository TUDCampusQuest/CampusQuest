'use client';

import {
  Card,
  Box,
  Typography,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import MapView from './MapView';

const trails = [
  'Technology Trail',
  'History Trail',
  'Sports Trail',
  'Library & Literature Trail',
];

export default function MapCard({ onSelectLocation }) {
  return (
    <Card
      sx={{
        mt: 4,
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: 4,
      }}
    >
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

        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 1 }}
          flexWrap="wrap"
        >
          {trails.map((trail) => (
            <Chip
              key={trail}
              label={trail}
              size="small"
              sx={{
                bgcolor: 'white',
                color: '#4F46E5',
                fontWeight: 500,
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* MAP CONTAINER — MapView stays untouched */}
      <Box
        sx={{
          height: { xs: 350, md: 500 }, // responsive
          width: '100%',
        }}
      >
        <MapView onSelectLocation={onSelectLocation} />
      </Box>

      {/* Legend */}
      <Divider />
      <Box sx={{ px: 3, py: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Map Legend
        </Typography>

        <Stack direction="row" spacing={3} flexWrap="wrap">
          <LegendItem color="#22C55E" label="Completed" />
          <LegendItem color="#EAB308" label="Next Stop" />
          <LegendItem color="#3B82F6" label="Available" />
          <LegendItem color="#9CA3AF" label="Inactive" />
          <LegendItem color="#6366F1" label="Your Location" />
        </Stack>
      </Box>
    </Card>
  );
}

function LegendItem({ color, label }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          bgcolor: color,
        }}
      />
      <Typography variant="caption">{label}</Typography>
    </Stack>
  );
}
