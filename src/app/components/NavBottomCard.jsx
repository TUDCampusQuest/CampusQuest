'use client';
import { Box, Stack, Typography, IconButton } from '@mui/material';
import NavigationIcon from '@mui/icons-material/Navigation';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/navigation';

/**
 * NavBottomCard
 * Slides up from the bottom when a location is selected but navigation
 * hasn't started yet. Shows building info + View Details / Navigate buttons.
 * Props: navTarget, onNavigate, onDismiss
 */
export default function NavBottomCard({ navTarget, onNavigate, onDismiss }) {
    const router = useRouter();
    if (!navTarget) return null;

    return (
        <Box sx={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 15,
            bgcolor: '#fff',
            borderRadius: '20px 20px 0 0',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
            px: { xs: 2.5, sm: 3 },
            pt: 1,
            pb: { xs: 'max(24px, env(safe-area-inset-bottom))', sm: '28px' },
            animation: 'slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
            {/* Drag handle */}
            <Box sx={{ width: 40, height: 4, bgcolor: '#e2e8f0', borderRadius: 99, mx: 'auto', mb: 2.5 }} />

            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                <Box>
                    <Typography sx={{
                        fontSize: 11, fontWeight: 700, color: '#1BA39C',
                        letterSpacing: '0.08em', textTransform: 'uppercase', mb: 0.5,
                    }}>
                        📍 {navTarget.id}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
                        {navTarget.name}
                    </Typography>
                </Box>
                <IconButton size="small" onClick={onDismiss} sx={{ bgcolor: '#f1f5f9', ml: 1.5, flexShrink: 0 }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Stack>

            <Typography sx={{ fontSize: 14, color: '#475569', lineHeight: 1.7, mb: 2.5 }}>
                {navTarget.description?.length > 90
                    ? navTarget.description.slice(0, 90) + '…'
                    : navTarget.description}
            </Typography>

            <Stack direction="row" spacing={1.5}>
                <Box onClick={() => router.push(`/location/${navTarget.id}`)} sx={{
                    flex: 1, py: 1.75, borderRadius: '12px',
                    border: '1.5px solid #e2e8f0', bgcolor: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'background 0.15s',
                    '&:hover': { bgcolor: '#f8fafc' },
                }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14 }}>View Details</Typography>
                </Box>
                <Box onClick={onNavigate} sx={{
                    flex: 2, py: 1.75, borderRadius: '12px',
                    background: 'linear-gradient(135deg, #1BA39C 0%, #15857f 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 1, cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(27,163,156,0.4)',
                    '&:hover': { opacity: 0.93 }, transition: 'opacity 0.15s',
                }}>
                    <NavigationIcon sx={{ color: '#fff', fontSize: 18 }} />
                    <Typography sx={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>Navigate</Typography>
                </Box>
            </Stack>
        </Box>
    );
}