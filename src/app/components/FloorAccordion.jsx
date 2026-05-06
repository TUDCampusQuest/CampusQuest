'use client';
import { getRoomDisplayName, getRoomTypeName } from '../lib/roomUtils';

const FLOOR_LABELS = { G: 'Ground Floor', '0': 'Ground Floor', '1': 'First Floor', '2': 'Second Floor', '3': 'Third Floor' };

export function getFloorLabel(floorName) {
    return FLOOR_LABELS[String(floorName)] || `Floor ${floorName}`;
}

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

export default function FloorAccordion({ floor, rooms, openFloor, setOpenFloor, onRoomClick, roomNameMap }) {
    const isOpen = openFloor === floor;
    const label  = getFloorLabel(floor);

    return (
        <div style={{ marginBottom: 8 }}>
            <button
                onClick={() => setOpenFloor(isOpen ? null : floor)}
                style={{
                    width: '100%', height: 48,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 16px',
                    background: isOpen ? 'var(--accent-teal)' : 'var(--bg-card)',
                    color: isOpen ? '#fff' : 'var(--text-primary)',
                    border: 'none', borderRadius: 12,
                    cursor: 'pointer', fontWeight: 600, fontSize: 14,
                    transition: 'background 0.2s, color 0.2s',
                }}
            >
                <span>{label}</span>
                <span style={{ fontSize: 11, opacity: 0.8 }}>{isOpen ? '▲' : '▼'}</span>
            </button>

            <div style={{ maxHeight: isOpen ? 600 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
                <div style={{
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid var(--glass-border)', borderTop: 'none',
                    borderRadius: '0 0 12px 12px', overflow: 'hidden',
                }}>
                    {rooms.map((f, i) => {
                        const p           = f.properties;
                        const displayName = getRoomDisplayName(p.roomCode, roomNameMap) || p.roomCode;
                        const typeName    = getRoomTypeName(p.roomCode, roomNameMap) || p.typeName || '';
                        const badgeStyle  = getRoomTypeBadgeStyle(typeName);
                        const isLast      = i === rooms.length - 1;
                        return (
                            <div
                                key={p.poiId}
                                onClick={() => onRoomClick(f)}
                                style={{
                                    minHeight: 44,
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '8px 16px',
                                    borderBottom: isLast ? 'none' : '1px solid var(--border-color)',
                                    cursor: 'pointer', transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <span style={{
                                    fontSize: 14, color: 'var(--text-primary)',
                                    flex: 1, overflow: 'hidden',
                                    textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8,
                                }}>
                                    {displayName}
                                </span>
                                {typeName && (
                                    <span style={{
                                        ...badgeStyle, fontSize: 10, fontWeight: 600,
                                        borderRadius: 20, padding: '2px 8px',
                                        whiteSpace: 'nowrap', flexShrink: 0,
                                    }}>
                                        {typeName}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
