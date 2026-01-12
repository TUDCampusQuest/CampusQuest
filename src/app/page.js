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

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Container maxWidth="lg">
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

      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Interactive Campus Map
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Explore TU Dublin Blanchardstown using themed trails
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography fontWeight="bold">Live GPS Tracking</Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Click start to begin GPS tracking.
              </Typography>
              <Button variant="outlined" sx={{ mt: 2 }} disabled>
                Start
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography fontWeight="bold">Trail Selection</Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                {[
                  'Technology Trail',
                  'History Trail',
                  'Sports Trail',
                  'Library & Literature Trail',
                ].map((trail) => (
                  <Grid item xs={12} sm={6} key={trail}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Typography fontWeight={500}>{trail}</Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <MapCard onSelectLocation={setSelectedLocation} />
      <InfoPanel
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
      />
    </Container>
  );
}
