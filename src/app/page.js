'use client';

import { Container, Box, Button } from '@mui/material';
import MapView from './components/MapView';
import QRScanner from './components/QRScanner';
import InfoPanel from './components/InfoPanel';

export default function Home() {
    return (
        <Container maxWidth="xl">
            <Box sx={{ height: '100vh' }}>
                <MapView />
                <QRScanner />
                <InfoPanel />
            </Box>
        </Container>
    );
}