'use client';
// Collapsible floor accordion listing rooms within a building floor, with type badges and click-to-navigate.
import { getRoomDisplayName, getRoomTypeName } from '../lib/roomUtils';
import styles from '../styles/FloorAccordion.module.css';

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
        <div className={styles.accordionItem}>
            <button
                onClick={() => setOpenFloor(isOpen ? null : floor)}
                className={styles.accordionBtn}
                style={{
                    background: isOpen ? 'var(--accent-teal)' : 'var(--bg-card)',
                    color: isOpen ? '#fff' : 'var(--text-primary)',
                }}
            >
                <span>{label}</span>
                <span className={styles.accordionChevron}>{isOpen ? '▲' : '▼'}</span>
            </button>

            <div className={styles.accordionBody} style={{ maxHeight: isOpen ? 600 : 0 }}>
                <div className={styles.accordionInner}>
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
                                className={styles.roomRow}
                                style={{ borderBottom: isLast ? 'none' : '1px solid var(--border-color)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <span className={styles.roomName}>{displayName}</span>
                                {typeName && (
                                    <span className={styles.roomBadge} style={badgeStyle}>{typeName}</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
