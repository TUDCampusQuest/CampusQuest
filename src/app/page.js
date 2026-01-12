'use client';

import { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    AppBar,
    Toolbar,
    Box,
    Button,
} from '@mui/material';
import MapCard from './components/MapCard';

export default function Home() {
    const [mounted, setMounted] = useState(false);
    const [selectedTrail, setSelectedTrail] = useState(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <>
            {/* NAVBAR / HEADER */}
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    background: 'rgba(0,0,0,0.35)',
                    backdropFilter: 'blur(10px)',
                }}
            >
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography fontWeight="bold">Campus Quest</Typography>

                    <Button
                        variant="contained"
                        size="small"
                        sx={{ textTransform: 'none' }}
                    >
                        Scan QR Code
                    </Button>
                </Toolbar>
            </AppBar>

            {/* PAGE CONTENT */}
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* PAGE TITLE */}
                <Typography
                    variant="h4"
                    fontWeight="bold"
                    textAlign="center"
                    gutterBottom
                    sx={{ color: 'white' }}
                >
                    Interactive Campus Map
                </Typography>

                <Typography
                    variant="subtitle1"
                    textAlign="center"
                    sx={{ color: 'rgba(255,255,255,0.8)' }}
                    gutterBottom
                >
                    Explore TU Dublin Blanchardstown using themed trails
                </Typography>

                {/* MAP CARD */}
                <Box sx={{ mt: 3 }}>
                    <MapCard
                        selectedTrail={selectedTrail}
                        setSelectedTrail={setSelectedTrail}
                    />
                </Box>
            </Container>
        </>
    );
}