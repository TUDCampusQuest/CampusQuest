'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Container, Typography } from '@mui/material';
import MapCard from './components/MapCard';

const InfoPanel = dynamic(() => import('./components/InfoPanel'), {
  ssr: false,
});

export default function Home() {
  const [selectedTrail, setSelectedTrail] = React.useState(null);
  const [selectedLocation, setSelectedLocation] = React.useState(null);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* PAGE TITLE */}
      <Typography
        variant="h4"
        fontWeight="bold"
        align="center"
        gutterBottom
      >
        Interactive Campus Map
      </Typography>

      <Typography
        variant="subtitle1"
        align="center"
        sx={{ mb: 4, opacity: 0.8 }}
      >
        Explore TU Dublin Blanchardstown using themed trails
      </Typography>

      {/* MAP CARD (ONLY TRAIL CONTROLS LIVE HERE NOW) */}
      <MapCard
        selectedTrail={selectedTrail}
        setSelectedTrail={setSelectedTrail}
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
