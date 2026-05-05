'use client';
import { Box } from '@mui/material';

export default function TrailStopCard({ activeTrail, currentTrailStopIndex, onAdvance, onClose }) {
    if (!activeTrail) return null;

    return (
        <Box sx={{
            position: 'fixed', bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
            left: 0, right: 0, zIndex: 40,
            px: 2, pb: 1,
        }}>
            <Box sx={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                p: 2,
                boxShadow: '0 -4px 24px rgba(0,0,0,0.3)',
            }}>
                {currentTrailStopIndex < (activeTrail.stops?.length ?? 0) ? (
                    <>
                        <Box sx={{ fontSize: 12, color: 'var(--text-secondary)', mb: 0.5 }}>
                            Stop {currentTrailStopIndex + 1} of {activeTrail.stops.length}
                        </Box>
                        <Box sx={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', mb: 0.5 }}>
                            Next stop: {activeTrail.stops[currentTrailStopIndex]?.name}
                        </Box>
                        <Box sx={{ fontSize: 13, color: 'var(--text-secondary)', mb: 1.5 }}>
                            {activeTrail.stops[currentTrailStopIndex]?.description}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Box
                                onClick={onAdvance}
                                sx={{
                                    flex: 1, height: 38, borderRadius: '10px',
                                    background: 'var(--accent-purple)', color: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                                }}
                            >
                                I'm Here ✓
                            </Box>
                            <Box
                                onClick={onClose}
                                sx={{
                                    px: 2, height: 38, borderRadius: '10px',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-secondary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 13, cursor: 'pointer',
                                }}
                            >
                                Exit
                            </Box>
                        </Box>
                    </>
                ) : (
                    <>
                        <Box sx={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', mb: 0.5 }}>
                            Trail Complete! 🎉
                        </Box>
                        <Box sx={{ fontSize: 13, color: 'var(--text-secondary)', mb: 1.5 }}>
                            You visited all {activeTrail.stops?.length} stops on {activeTrail.name}.
                        </Box>
                        <Box
                            onClick={onClose}
                            sx={{
                                height: 38, borderRadius: '10px',
                                background: 'var(--accent-teal)', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                            }}
                        >
                            Done
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
}
