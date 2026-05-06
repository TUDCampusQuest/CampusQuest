'use client';
import { Box } from '@mui/material';

export function ArrivedToast({ show }) {
    if (!show) return null;
    return (
        <Box sx={{
            position: 'absolute', top: 16, left: '50%',
            transform: 'translateX(-50%)', zIndex: 30,
            background: '#7C3AED', color: '#fff', fontWeight: 700,
            fontSize: 14, px: 3, py: 1.5, borderRadius: 99,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)', whiteSpace: 'nowrap',
        }}>
            ✅ You have arrived!
        </Box>
    );
}

export function PickFromMapBanner({ field, onCancel }) {
    if (!field) return null;
    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            zIndex: 1060,
            background: 'rgba(124,58,237,0.92)',
            backdropFilter: 'blur(10px)',
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            color: '#fff', fontWeight: 700, fontSize: 14,
        }}>
            <span>📌 Tap the map to set {field === 'A' ? 'start point' : 'destination'}</span>
            <button
                onClick={onCancel}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}
            >✕</button>
        </div>
    );
}

export function StairsPrompt({ show, floorName }) {
    if (!show) return null;
    return (
        <div style={{
            position: 'absolute', top: 60, left: 8, right: 8,
            zIndex: 1050,
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)',
            borderLeft: '4px solid #7C3AED',
            borderRadius: 14,
            padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: 'var(--card-shadow)',
            pointerEvents: 'none',
        }}>
            <span style={{ fontSize: 20 }}>🪜</span>
            <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                    Head to the stairs
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Your destination is on floor {floorName} — map updated
                </div>
            </div>
        </div>
    );
}
