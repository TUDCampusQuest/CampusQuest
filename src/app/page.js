'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import {
  Container,
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
} from '@mui/material';

import MapCard from './components/MapCard';

const InfoPanel = dynamic(() => import('./components/InfoPanel'), {
  ssr: false,
});

export default function Home() {
  const [mounted, setMounted] = React.useState(false);
  const [selectedLocation, setSelectedLocation] = React.useState(null);
  const [selectedTrail, setSelectedTrail] = React.useState(
    'Technology Trail'
  );

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Container maxWidth="lg">
      {/* HEADER */}
      <Box
        sx={{
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Campus Quest
        </Typography>

        <Button variant="contained" size="small">
          Scan QR Code
        </Button>
      </Box>

      {/* HERO */}
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Interactive Campus Map
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Explore TU Dublin Blanchardstown using themed trails
        </Typography>
      </Box>

      {/* TRAIL SELECTION */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography fontWeight="bold" gutterBottom>
            Trail Selection
          </Typography>

          <Grid container spacing={2}>
            {[
              { name: 'Technology Trail', color: '#3B82F6' },
              { name: 'History Trail', color: '#EF4444' },
              { name: 'Sports Trail', color: '#F97316' },
              { name: 'Library & Literature Trail', color: '#8B5CF6' },
            ].map((trail) => (
              <Grid item xs={12} sm={6} md={3} key={trail.name}>
                <Button
                  fullWidth
                  variant={
                    selectedTrail === trail.name
                      ? 'contained'
                      : 'outlined'
                  }
                  sx={{
                    height: 48,
                    bgcolor:
                      selectedTrail === trail.name
                        ? trail.color
                        : 'transparent',
                    borderColor: trail.color,
                    color:
                      selectedTrail === trail.name
                        ? 'white'
                        : trail.color,
                    fontWeight: 500,
                    '&:hover': {
                      bgcolor: trail.color,
                      color: 'white',
                    },
                  }}
                  onClick={() => setSelectedTrail(trail.name)}
                >
                  {trail.name}
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* MAP CARD */}
      <MapCard
        selectedTrail={selectedTrail}
        onSelectLocation={setSelectedLocation}
      />

      {/* INFO PANEL */}
      <InfoPanel
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
      />
    </Container>
  );
}
