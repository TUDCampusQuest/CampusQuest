'use client';
import { Box, Stack, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * NavHUD
 * Dark gradient banner at the top of the map shown while navigating.
 * Props: navTarget, onExit
 */
export default function NavHUD({ navTarget, onExit }) {
    if (!navTarget) return null;
    return (
        <Box sx={{
            position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            px: 2.5, py: 1.5,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
        }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{
                    width: 10, height: 10, borderRadius: '50%',
                    bgcolor: '#1BA39C',
                    boxShadow: '0 0 0 3px rgba(27,163,156,0.3)',
                    animation: 'hudPulse 1.6s ease-in-out infinite',
                    flexShrink: 0,
                }} />
                <Box>
                    <Typography sx={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Navigating to
                    </Typography>
                    <Typography sx={{ fontSize: 16, color: '#f1f5f9', fontWeight: 800, lineHeight: 1.2 }}>
                        {navTarget.name}
                    </Typography>
                </Box>
            </Stack>
            <IconButton onClick={onExit} size="small" sx={{
                bgcolor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#f1f5f9', borderRadius: 2,
                px: 1.5, gap: 0.5,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
            }}>
                <CloseIcon fontSize="small" />
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>Exit</Typography>
            </IconButton>
        </Box>
    );
}