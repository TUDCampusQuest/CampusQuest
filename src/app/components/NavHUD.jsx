'use client';
import { Box, Stack, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function fmtDist(m) {
    return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

export default function NavHUD({ navTarget, activeRoute, onExit }) {
    const isIndoor   = activeRoute != null && activeRoute.steps?.length > 0;
    const isOutdoor  = navTarget != null;
    if (!isIndoor && !isOutdoor) return null;

    // Derive the destination name for indoor nav from the arrived step
    const indoorDestName = isIndoor
        ? (activeRoute.steps.find(s => s.type === 'arrived')?.description
              ?.replace('You have arrived at ', '') ?? 'destination')
        : null;

    return (
        <Box sx={{
            position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
            background: 'var(--header-bg)',
            borderBottom: '1px solid var(--header-border)',
            px: 2.5, py: 1.5,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
        }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{
                    width: 10, height: 10, borderRadius: '50%',
                    bgcolor: isIndoor ? '#00B4B4' : '#7C3AED',
                    boxShadow: isIndoor
                        ? '0 0 0 3px rgba(0,180,180,0.3)'
                        : '0 0 0 3px rgba(124,58,237,0.3)',
                    animation: 'hudPulse 1.6s ease-in-out infinite',
                    flexShrink: 0,
                }} />
                <Box>
                    <Typography sx={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        {isIndoor ? 'Indoor navigation' : 'Navigating to'}
                    </Typography>
                    <Typography sx={{ fontSize: 16, color: 'var(--text-primary)', fontWeight: 800, lineHeight: 1.2 }}>
                        {isIndoor ? indoorDestName : navTarget.name}
                    </Typography>
                    {isIndoor && (
                        <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', mt: 0.3 }}>
                            {activeRoute.totalMinutes} min · {fmtDist(activeRoute.totalMetres)}
                            {activeRoute.requiresStairs ? ' · Stairs' : ''}
                        </Typography>
                    )}
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
