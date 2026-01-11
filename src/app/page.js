'use client';

import * as React from 'react';
import { Container, Box, Button, Typography } from '@mui/material';
import MapView from './components/MapView';
import InfoPanel from './components/InfoPanel';

export default function Home() {
    const [selectedLocation, setSelectedLocation] = React.useState(null);

    return (
        <Container
            maxWidth={false}
            disableGutters
            sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: 2,
                    borderBottom: '1px solid #e0e0e0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
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

            {/* Main Content */}
            <Box
                sx={{
                    flex: 1,
                    position: 'relative'
                }}
            >
                <MapView onSelectLocation={setSelectedLocation} />
            </Box>

            {/* Info Panel */}
            <InfoPanel
                location={selectedLocation}
                onClose={() => setSelectedLocation(null)}
            />
        </Container>
    );
}