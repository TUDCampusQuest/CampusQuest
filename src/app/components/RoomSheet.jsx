'use client';
// Bottom slide-up card showing room details with Navigate Here and Set as Start actions.
import { getRoomDisplayName, getRoomTypeName } from '../lib/roomUtils';
import GlassCard from './ui/GlassCard';
import styles from '../styles/RoomSheet.module.css';

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

export default function RoomSheet({ selectedRoom, onClose, onNavigateTo, onSetAsStart, roomNameMap }) {
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
                padding: '0 16px 24px',
            }}
        >
            <div onClick={onClose} className={styles.dragHandle}>
                <div className={styles.dragBar} />
            </div>

            <div className={styles.nameRow}>
                <span className={styles.roomName}>{displayName}</span>
                {showCode && <span className={styles.codePill}>{p.roomCode}</span>}
            </div>

            <div className={styles.metaRow}>
                <span className={styles.metaText}>
                    {p.buildingName}{p.floorName ? ` · Floor ${p.floorName}` : ''}
                </span>
                {typeName && (
                    <span className={styles.typeBadge} style={badgeStyle}>{typeName}</span>
                )}
            </div>

            <div className={styles.divider} />

            <div className={styles.btns}>
                <button onClick={() => onNavigateTo(selectedRoom)} className={styles.btnNavigate}>
                    Navigate Here
                </button>
                <button onClick={() => onSetAsStart(selectedRoom)} className={styles.btnStart}>
                    Set as Start
                </button>
            </div>
        </GlassCard>
    );
}
