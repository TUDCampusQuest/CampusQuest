'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {AppBar, Toolbar, Box, Container, Typography, Button, Card, Stack,} from '@mui/material';

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
            <Box
                sx={{
                    height: 150,
                    position: 'relative',
                    backgroundImage: `url(${trail.headerImageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
            </Box>

            <Box sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight={900}>
                    {trail.title}
                </Typography>

                <Typography sx={{ mt: 1.2, color: 'rgba(17,24,39,0.75)', fontSize: 14 }}>
                    {trail.desc}
                </Typography>

                <Stack sx={{ mt: 3 }}>
                    <Box>
                        <Typography fontWeight={900} sx={{ fontSize: 18 }}>
                            {trail.duration}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: 'rgba(17,24,39,0.55)' }}>
                            Duration
                        </Typography>
                    </Box>
                </Stack>
            </Box>
        </Card>
    );
}

export default function TrailsPage() {
    const [mounted, setMounted] = useState(false);
    const [trails, setTrails] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/trails', { cache: 'no-store' });
                const data = await res.json();
                setTrails(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (!mounted) return null;

    return (
        <>
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
                        <Button component={Link} href="/" color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
                            Home
                        </Button>

                        <Button component={Link} href="/trails" color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
                            Trails
                        </Button>

                        <Button component={Link} href="/scan" variant="contained" size="small" sx={{ textTransform: 'none', fontWeight: 700 }}>
                            Scan
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fb', py: { xs: 4, md: 6 } }}>
                <Container maxWidth="lg">
                    {loading ? (
                        <Typography sx={{ color: 'rgba(17,24,39,0.7)' }}>Loading trails...</Typography>
                    ) : (
                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            spacing={4}
                            justifyContent="center"
                            alignItems="stretch"
                        >
                            {trails.map((trail) => (
                                <TrailCard key={trail._id} trail={trail} />
                            ))}
                        </Stack>
                    )}
                </Container>
            </Box>
        </>
    );
}