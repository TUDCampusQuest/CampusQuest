'use client';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getRoomDisplayName, getRoomTypeName } from '../lib/roomUtils';

export default function RoomSheet({ selectedRoom, gpsLocation, onClose, onNavigate, roomNameMap }) {
    if (!selectedRoom) return null;
    const p = selectedRoom.properties;

    const displayName = getRoomDisplayName(p.roomCode, roomNameMap) || p.roomCode;
    const typeName    = getRoomTypeName(p.roomCode, roomNameMap);
    const showType    = typeName && typeName !== p.typeName && typeName !== displayName;

    return (
        <Box sx={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderTop: '1px solid var(--border-subtle)',
            borderRadius: '20px 20px 0 0',
            boxShadow: 'var(--shadow-panel)',
            px: 2.5, pt: 2, pb: 2.5,
            display: 'flex', flexDirection: 'column', gap: 1.5,
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: 16, lineHeight: 1.25, color: 'var(--text-primary)' }}>
                        {displayName}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: 'var(--text-muted)', mt: 0.4 }}>
                        {displayName !== p.roomCode ? `${p.roomCode} · ` : ''}
                        {p.buildingName}
                        {p.floorName ? ` · Floor ${p.floorName}` : ''}
                        {showType ? ` · ${typeName}` : ''}
                    </Typography>
                </Box>
                <IconButton size="small" onClick={onClose} sx={{ color: 'var(--text-secondary)' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            <Box
                component="button"
                disabled={!gpsLocation}
                onClick={() => onNavigate(selectedRoom)}
                sx={{
                    width: '100%', py: 1.25, borderRadius: '12px', border: 'none',
                    background: gpsLocation ? 'var(--accent-teal2)' : 'var(--bg-input)',
                    color: gpsLocation ? '#fff' : 'var(--text-muted)',
                    fontWeight: 700, fontSize: 14,
                    cursor: gpsLocation ? 'pointer' : 'not-allowed',
                    transition: 'background 0.2s',
                    '&:hover': gpsLocation ? { background: '#009999' } : {},
                }}
            >
                {gpsLocation ? 'Navigate Here' : 'Enable GPS to navigate'}
            </Box>
        </Box>
    );
}
