'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Container, Box, Button, Typography } from '@mui/material';

const MapView = dynamic(() => import('./components/MapView'), {
  ssr: false,
});

const InfoPanel = dynamic(() => import('./components/InfoPanel'), {
  ssr: false,
});


export default function Home() {
  const [selectedLocation, setSelectedLocation] = React.useState(null);

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Campus Quest
        </Typography>

        <Button
          variant="contained"
          size="small"
          onClick={() => alert('QR scanner coming next')}
        >
          Scan QR Code
        </Button>
      </Box>

      {/* Map Area */}
      <Box
        sx={{
          flex: 1,
          position: 'relative',
        }}
      >
        <MapView onSelectLocation={setSelectedLocation} />
      </Box>

      {/* Location Info Panel */}
      <InfoPanel
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
      />
    </Container>
  );
}
