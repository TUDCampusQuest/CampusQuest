'use client';

import { useEffect, useState } from 'react';
import {Container, Typography, AppBar, Toolbar, Box, Button,} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MapCard from './components/MapCard';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedTrail, setSelectedTrail] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleHomeClick = () => {
    setSelectedTrail(null);
    router.push('/');
  };

  if (!mounted) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'white' }}>
      {/* Navbar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: '#000',
          color: '#fff',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography fontWeight="bold">CampusQuest</Typography>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              onClick={handleHomeClick}
              color="inherit"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Home
            </Button>

            <Button
              component={Link}
              href="/trails"
              color="inherit"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Trails
            </Button>

            <Button
              component={Link}
              href="/scan"
              variant="contained"
              size="small"
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Scan
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
          sx={{ color: '#111827' }}
        >
          Interactive Campus Map
        </Typography>

        <Typography
          variant="subtitle1"
          textAlign="center"
          sx={{ color: 'rgba(17,24,39,0.75)' }}
          gutterBottom
        >
          Explore TU Dublin Blanchardstown using themed trails
        </Typography>

        <Box sx={{ mt: 3 }}>
          <MapCard
            selectedTrail={selectedTrail}
            setSelectedTrail={setSelectedTrail}
          />
        </Box>
      </Container>
    </Box>
  );
}