'use client';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getRoomDisplayName, getRoomTypeName } from '../lib/roomUtils';
import GlassCard from './ui/GlassCard';

function getRoomTypeBadgeStyle(typeName) {
    const t = (typeName || '').toLowerCase();
    if (t.includes('lecture') || t.includes('theatre') || t.includes('auditorium'))
        return { background: '#7C3AED22', color: 'var(--accent-purple)' };
    if (t.includes('computer') || t.includes('lab'))
        return { background: '#00B4B422', color: 'var(--accent-teal)' };
    if (t.includes('laborator'))
        return { background: '#E67E2222', color: '#E67E22' };
    if (t.includes('toilet') || t.includes('wc') || t.includes('bathroom') || t.includes('washroom'))
        return { background: '#94A3B822', color: 'var(--text-secondary)' };
    if (t.includes('stair'))
        return { background: '#FFB34722', color: '#E67E22' };
    return { background: 'var(--bg-card)', color: 'var(--text-secondary)' };
}

export default function RoomSheet({ selectedRoom, gpsLocation, onClose, onNavigate, onNavigateFrom, roomNameMap }) {
    if (!selectedRoom) return null;
    const p = selectedRoom.properties;

    const displayName = getRoomDisplayName(p.roomCode, roomNameMap) || p.roomCode;
    const typeName    = getRoomTypeName(p.roomCode, roomNameMap) || p.typeName || '';
    const showCode    = displayName !== p.roomCode;
    const badgeStyle  = getRoomTypeBadgeStyle(typeName);

    return (
        <GlassCard
            style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
                borderRadius: '20px 20px 0 0',
                borderTop: '2px solid var(--accent-purple)',
                padding: '0 20px 20px',
            }}
        >
            {/* Drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, paddingBottom: 4 }}>
                <div style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--border-color)' }} />
            </div>

            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 8 }}>
                <div style={{ flex: 1, paddingRight: 8 }}>
                    {/* Room name + code pill */}
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                            {displayName}
                        </span>
                        {showCode && (
                            <span style={{
                                background: 'var(--accent-purple)', color: '#fff',
                                fontSize: 12, fontWeight: 600, borderRadius: 20,
                                padding: '3px 10px',
                            }}>
                                {p.roomCode}
                            </span>
                        )}
                    </div>

                    {/* Building / floor / type */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                            {p.buildingName}
                            {p.floorName ? ` · Floor ${p.floorName}` : ''}
                        </span>
                        {typeName && (
                            <span style={{
                                ...badgeStyle,
                                fontSize: 11, fontWeight: 600,
                                borderRadius: 20, padding: '2px 8px',
                            }}>
                                {typeName}
                            </span>
                        )}
                    </div>
                </div>

                <IconButton size="small" onClick={onClose} sx={{ color: 'var(--text-secondary)', mt: '-4px' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--border-color)', margin: '14px 0' }} />

            {/* Navigation buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
                {/* Navigate from GPS */}
                <button
                    disabled={!gpsLocation}
                    onClick={() => onNavigate(selectedRoom)}
                    style={{
                        flex: 1, height: 48, borderRadius: 12, border: 'none',
                        background: gpsLocation ? 'var(--accent-teal)' : 'var(--bg-card)',
                        color: gpsLocation ? '#fff' : 'var(--text-secondary)',
                        fontWeight: 700, fontSize: 13,
                        cursor: gpsLocation ? 'pointer' : 'not-allowed',
                        transition: 'background 0.2s',
                    }}
                    title="Navigate from your current location"
                >
                    Navigate Here
                </button>

                {/* Navigate from custom location */}
                <button
                    onClick={() => onNavigateFrom(selectedRoom)}
                    style={{
                        flex: 1, height: 48, borderRadius: 12, border: '1px solid var(--accent-teal)',
                        background: 'transparent',
                        color: 'var(--accent-teal)',
                        fontWeight: 700, fontSize: 13,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    title="Pick a starting location on the map"
                >
                    Navigate from...
                </button>
            </div>
        </GlassCard>
    );
}
