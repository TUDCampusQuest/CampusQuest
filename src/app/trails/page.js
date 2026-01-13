'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {AppBar, Toolbar, Box, Container, Typography, Button, Card, Stack,} from '@mui/material';

const TRAILS = [
    {
        key: 'technology',
        title: 'Technology Trail',
        desc: 'Explore cutting-edge technology facilities and innovation spaces across campus',
        duration: '45-60 minutes',
        headerBg: 'linear-gradient(180deg, rgba(59,130,246,0.22), rgba(59,130,246,0.08))',
    },
    {
        key: 'sports',
        title: 'Sports Trail',
        desc: 'Experience world-class athletic facilities and sports heritage at TU Dublin',
        duration: '40-55 minutes',
        headerBg: 'linear-gradient(180deg, rgba(249,115,22,0.22), rgba(249,115,22,0.10))',
    },
];

function TrailCard({ trail }) {
    return (
        <Card
            sx={{
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: 4,
                width: '100%',
                maxWidth: 560,
                bgcolor: 'white',
            }}
        >
            {/* Header gradient */}
            <Box sx={{ height: 150, position: 'relative', background: trail.headerBg }}>
                <Typography
                    sx={{
                        position: 'absolute',
                        top: 18,
                        left: 18,
                        fontSize: 13,
                        fontWeight: 800,
                        color: 'rgba(17,24,39,0.75)',
                    }}
                >
                    {trail.title}
                </Typography>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight={900}>
                    {trail.title}
                </Typography>

                <Typography sx={{ mt: 1.2, color: 'rgba(17,24,39,0.75)', fontSize: 14 }}>
                    {trail.desc}
                </Typography>

                {/* Duration */}
                <Stack sx={{ mt: 3 }}>
                    <Box>
                        <Typography fontWeight={900} sx={{ fontSize: 18 }}>
                            {trail.duration}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: 'rgba(17,24,39,0.55)' }}>Duration</Typography>
                    </Box>
                </Stack>
            </Box>
        </Card>
    );
}

export default function TrailsPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    return (
        <>
            {/* Navbar */}
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

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Button
                            component={Link}
                            href="/"
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

            {/* Trials Section */}
            <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fb', py: { xs: 4, md: 6 } }}>
                <Container maxWidth="lg">
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={4}
                        justifyContent="center"
                        alignItems="stretch"
                    >
                        {TRAILS.map((trail) => (
                            <TrailCard key={trail.key} trail={trail} />
                        ))}
                    </Stack>
                </Container>
            </Box>
        </>
    );
}