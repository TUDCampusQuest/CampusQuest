'use client';
import GlassCard from './ui/GlassCard';

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
        <span style={{
            background: c.bg, color: c.text,
            borderRadius: 99, padding: '2px 10px',
            fontSize: 11, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
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
        <GlassCard style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{
                        fontSize: 16, fontWeight: 700, color: 'var(--text-primary)',
                        flex: 1, marginRight: 8, lineHeight: 1.3,
                    }}>
                        {trail.name}
                    </span>
                    <span style={{
                        background: 'rgba(124,58,237,0.18)', color: 'var(--accent-purple)',
                        borderRadius: 99, padding: '3px 10px',
                        fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                        {trail.stops?.length ?? (typeof trail.points === 'number' ? trail.points : (trail.points?.length ?? 0))} pts
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    {trail.category && <CategoryBadge category={trail.category} />}
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📍 {estimateDistance(trail)}</span>
                    {trail.estimatedMinutes && (
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🕐 {trail.estimatedMinutes} min</span>
                    )}
                </div>

                {trail.description && (
                    <div style={{
                        fontSize: 13, color: 'var(--text-secondary)',
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.5,
                    }}>
                        {trail.description}
                    </div>
                )}
            </div>

            {trail.stops?.length > 0 && (
                <div style={{ padding: '0 16px 10px', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
                    {trail.stops.slice(0, 3).map(stop => (
                        <span key={stop.id} style={{
                            background: 'var(--bg-card)', color: 'var(--text-secondary)',
                            borderRadius: 12, padding: '4px 10px', fontSize: 11,
                            whiteSpace: 'nowrap', flexShrink: 0,
                        }}>
                            {stop.name}
                        </span>
                    ))}
                    {trail.stops.length > 3 && (
                        <span style={{
                            background: 'var(--bg-card)', color: 'var(--text-secondary)',
                            borderRadius: 12, padding: '4px 10px', fontSize: 11,
                            whiteSpace: 'nowrap', flexShrink: 0,
                        }}>
                            +{trail.stops.length - 3} more
                        </span>
                    )}
                </div>
            )}

            <div style={{ height: 1, background: 'var(--border-color)' }} />

            <div style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                <button
                    className="trail-card-btn"
                    onClick={onView}
                    style={{
                        flex: 1, height: 40,
                        background: 'transparent', border: '1px solid var(--accent-teal)',
                        color: 'var(--accent-teal)', borderRadius: 10,
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}
                >
                    View on Map
                </button>
                <button
                    className="trail-card-btn"
                    onClick={onStart}
                    style={{
                        flex: 1, height: 40,
                        background: 'var(--accent-purple)', border: 'none',
                        color: '#fff', borderRadius: 10,
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}
                >
                    Start Trail
                </button>
            </div>
        </GlassCard>
    );
}
