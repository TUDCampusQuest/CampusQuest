'use client';

import { useEffect, useState } from 'react';
import { Container, Typography } from '@mui/material';
import MapCard from './components/MapCard';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [selectedTrail, setSelectedTrail] = useState(null);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* PAGE TITLE */}
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="center"
        gutterBottom
      >
        Interactive Campus Map
      </Typography>

      <Typography
        variant="subtitle1"
        textAlign="center"
        color="text.secondary"
        gutterBottom
      >
        Explore TU Dublin Blanchardstown using themed trails
      </Typography>

      {/* MAP CARD */}
      <MapCard
        selectedTrail={selectedTrail}
        setSelectedTrail={setSelectedTrail}
      />
    </Container>
  );
}
