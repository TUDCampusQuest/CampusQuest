'use client';
// Trail card component with category badge, stop chips, and view/start action buttons.
import GlassCard from './ui/GlassCard';
import styles from './TrailCard.module.css';

const CATEGORY_TABS = [
    { key: 'all',      label: 'All',      emoji: '🗺️' },
    { key: 'nature',   label: 'Nature',   emoji: '🌿' },
    { key: 'tech',     label: 'Tech',     emoji: '💻' },
    { key: 'academic', label: 'Academic', emoji: '🎓' },
    { key: 'social',   label: 'Social',   emoji: '☕' },
    { key: 'fitness',  label: 'Fitness',  emoji: '🏃' },
];

export { CATEGORY_TABS };

const CATEGORY_COLORS = {
    nature:   { bg: 'rgba(109,189,69,0.13)',  text: '#6DBD45' },
    tech:     { bg: 'rgba(0,180,180,0.13)',   text: '#00B4B4' },
    academic: { bg: 'rgba(124,58,237,0.13)', text: 'var(--accent-purple)' },
    social:   { bg: 'rgba(230,126,34,0.13)', text: '#E67E22' },
    fitness:  { bg: 'rgba(233,30,99,0.13)',  text: '#E91E63' },
};

function CategoryBadge({ category }) {
    const c   = CATEGORY_COLORS[category] ?? { bg: 'rgba(255,255,255,0.1)', text: 'var(--text-secondary)' };
    const tab = CATEGORY_TABS.find(t => t.key === category);
    return (
        <span className={styles.categoryBadge} style={{ background: c.bg, color: c.text }}>
            {tab?.emoji} {category ?? 'general'}
        </span>
    );
}

function estimateDistance(trail) {
    if (trail.distance) return `${trail.distance}m`;
    if (trail.points?.length) {
        const m = trail.points.length * 8;
        return m >= 1000 ? `~${(m / 1000).toFixed(1)}km` : `~${m}m`;
    }
    return '—';
}

export default function TrailCard({ trail, onView, onStart }) {
    return (
        <GlassCard className={styles.card}>
            <div className={styles.cardBody}>
                <div className={styles.nameRow}>
                    <span className={styles.name}>{trail.name}</span>
                    <span className={styles.pointsBadge}>
                        {trail.stops?.length ?? (typeof trail.points === 'number' ? trail.points : (trail.points?.length ?? 0))} pts
                    </span>
                </div>

                <div className={styles.metaRow}>
                    {trail.category && <CategoryBadge category={trail.category} />}
                    <span className={styles.metaText}>📍 {estimateDistance(trail)}</span>
                    {trail.estimatedMinutes && (
                        <span className={styles.metaText}>🕐 {trail.estimatedMinutes} min</span>
                    )}
                </div>

                {trail.description && (
                    <div className={styles.description}>{trail.description}</div>
                )}
            </div>

            {trail.stops?.length > 0 && (
                <div className={styles.stopsRow}>
                    {trail.stops.slice(0, 3).map(stop => (
                        <span key={stop.id} className={styles.stopChip}>{stop.name}</span>
                    ))}
                    {trail.stops.length > 3 && (
                        <span className={styles.stopChip}>+{trail.stops.length - 3} more</span>
                    )}
                </div>
            )}

            <div className={styles.divider} />

            <div className={styles.actions}>
                <button className={styles.btnView} onClick={onView}>View on Map</button>
                <button className={styles.btnStart} onClick={onStart}>Start Trail</button>
            </div>
        </GlassCard>
    );
}
