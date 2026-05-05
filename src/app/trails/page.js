'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '../components/ui/GlassCard';
import { buildTrailPath, calcTrailDistance } from '../lib/trailRouter';
import useIndoorData from '../hooks/useIndoorData';

const CATEGORY_TABS = [
  { key: 'all',      label: 'All',      emoji: '🗺️' },
  { key: 'nature',   label: 'Nature',   emoji: '🌿' },
  { key: 'tech',     label: 'Tech',     emoji: '💻' },
  { key: 'academic', label: 'Academic', emoji: '🎓' },
  { key: 'social',   label: 'Social',   emoji: '☕' },
  { key: 'fitness',  label: 'Fitness',  emoji: '🏃' },
];

const CATEGORY_COLORS = {
  nature:   { bg: 'rgba(109,189,69,0.13)',  text: '#6DBD45' },
  tech:     { bg: 'rgba(0,180,180,0.13)',   text: '#00B4B4' },
  academic: { bg: 'rgba(124,58,237,0.13)', text: 'var(--accent-purple)' },
  social:   { bg: 'rgba(230,126,34,0.13)', text: '#E67E22' },
  fitness:  { bg: 'rgba(233,30,99,0.13)',  text: '#E91E63' },
};

function CategoryBadge({ category }) {
  const c = CATEGORY_COLORS[category] ?? { bg: 'rgba(255,255,255,0.1)', text: 'var(--text-secondary)' };
  const tab = CATEGORY_TABS.find(t => t.key === category);
  return (
    <span style={{
      background: c.bg,
      color: c.text,
      borderRadius: 99,
      padding: '2px 10px',
      fontSize: 11,
      fontWeight: 700,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
    }}>
      {tab?.emoji} {category ?? 'general'}
    </span>
  );
}

export default function TrailsPage() {
  const router = useRouter();
  const { campusGraph } = useIndoorData();

  const [trails, setTrails]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchTrails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch('/api/trails', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setTrails(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message ?? 'Failed to load trails');
      setTrails([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTrails(); }, [fetchTrails]);

  const filtered = activeTab === 'all'
    ? trails
    : trails.filter(t => t.category === activeTab);

  function handleViewTrail(trail) {
    const stops = trail.stops ?? [];
    const path  = buildTrailPath(stops, campusGraph);
    const distance = calcTrailDistance(path);
    localStorage.setItem('activeTrail', JSON.stringify({
      ...trail,
      computedPath: path,
      computedDistance: distance,
    }));
    router.push('/');
  }

  function handleStartTrail(trail) {
    const stops = trail.stops ?? [];
    const path  = buildTrailPath(stops, campusGraph);
    const distance = calcTrailDistance(path);
    localStorage.setItem('startTrail', JSON.stringify({
      ...trail,
      computedPath: path,
      computedDistance: distance,
    }));
    router.push('/');
  }

  function handleOpenDesigner() {
    router.push('/');
  }

  const estimateDistance = (trail) => {
    if (trail.distance) return `${trail.distance}m`;
    if (trail.points?.length) {
      const m = trail.points.length * 8;
      return m >= 1000 ? `~${(m / 1000).toFixed(1)}km` : `~${m}m`;
    }
    return '—';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      overflowY: 'auto',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 20px))',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 0' }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 800,
          color: 'var(--text-primary)',
          margin: 0,
        }}>
          Campus Trails
        </h1>
        <p style={{
          fontSize: 14,
          color: 'var(--text-secondary)',
          margin: '4px 0 0',
        }}>
          Explore TUD Blanchardstown your way
        </p>
      </div>

      {/* Category tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        padding: '16px 16px',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}>
        <style>{`
          .trail-card-btn { transition: opacity 0.15s; }
          .trail-card-btn:hover { opacity: 0.85; }
          .trail-card-btn:active { opacity: 0.7; }
          .trail-tab-row::-webkit-scrollbar { display: none; }
        `}</style>
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flexShrink: 0,
              padding: '8px 16px',
              borderRadius: 20,
              border: activeTab === tab.key ? 'none' : '1px solid var(--border-color)',
              background: activeTab === tab.key ? 'var(--accent-purple)' : 'var(--bg-card)',
              color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)', fontSize: 14 }}>
            Loading trails...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{
            background: 'rgba(220,38,38,0.12)',
            border: '1px solid rgba(220,38,38,0.3)',
            borderRadius: 14,
            padding: 16,
            color: '#ef4444',
            fontSize: 14,
            fontWeight: 600,
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && trails.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 6 }}>No trails saved yet</div>
            <div style={{ fontSize: 13 }}>Open the Trail Designer on the map to record your first trail.</div>
          </div>
        )}

        {/* No results for filter */}
        {!loading && !error && trails.length > 0 && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)', fontSize: 14 }}>
            No {activeTab} trails yet.
          </div>
        )}

        {/* Trail cards */}
        {!loading && !error && filtered.map(trail => (
          <GlassCard key={trail.id} style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            {/* Top section */}
            <div style={{ padding: 16 }}>
              {/* Row 1: name + points badge */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  flex: 1,
                  marginRight: 8,
                  lineHeight: 1.3,
                }}>
                  {trail.name}
                </span>
                <span style={{
                  background: 'rgba(124,58,237,0.18)',
                  color: 'var(--accent-purple)',
                  borderRadius: 99,
                  padding: '3px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  {trail.stops?.length ?? (typeof trail.points === 'number' ? trail.points : (trail.points?.length ?? 0))} pts
                </span>
              </div>

              {/* Row 2: category + distance + time */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                {trail.category && <CategoryBadge category={trail.category} />}
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  📍 {estimateDistance(trail)}
                </span>
                {trail.estimatedMinutes && (
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    🕐 {trail.estimatedMinutes} min
                  </span>
                )}
              </div>

              {/* Row 3: description (2 lines max) */}
              {trail.description && (
                <div style={{
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.5,
                }}>
                  {trail.description}
                </div>
              )}
            </div>

            {/* Stops preview chips */}
            {trail.stops?.length > 0 && (
              <div style={{
                padding: '0 16px 10px',
                display: 'flex',
                gap: 6,
                overflowX: 'auto',
                scrollbarWidth: 'none',
              }}>
                {trail.stops.slice(0, 3).map(stop => (
                  <span key={stop.id} style={{
                    background: 'var(--bg-card)',
                    color: 'var(--text-secondary)',
                    borderRadius: 12,
                    padding: '4px 10px',
                    fontSize: 11,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}>
                    {stop.name}
                  </span>
                ))}
                {trail.stops.length > 3 && (
                  <span style={{
                    background: 'var(--bg-card)',
                    color: 'var(--text-secondary)',
                    borderRadius: 12,
                    padding: '4px 10px',
                    fontSize: 11,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}>
                    +{trail.stops.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--border-color)' }} />

            {/* Action buttons */}
            <div style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
              <button
                className="trail-card-btn"
                onClick={() => handleViewTrail(trail)}
                style={{
                  flex: 1,
                  height: 40,
                  background: 'transparent',
                  border: '1px solid var(--accent-teal)',
                  color: 'var(--accent-teal)',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                View on Map
              </button>
              <button
                className="trail-card-btn"
                onClick={() => handleStartTrail(trail)}
                style={{
                  flex: 1,
                  height: 40,
                  background: 'var(--accent-purple)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Start Trail
              </button>
            </div>
          </GlassCard>
        ))}

        {/* Create Your Own Trail banner */}
        {!loading && (
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-purple), #4F46E5)',
            padding: 20,
            borderRadius: 16,
            marginTop: 4,
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              Create Your Own Trail
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 12 }}>
              Add stops, name it, share with others
            </div>
            <button
              onClick={handleOpenDesigner}
              style={{
                background: '#fff',
                color: 'var(--accent-purple)',
                border: 'none',
                borderRadius: 10,
                padding: '10px 20px',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Open Trail Designer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
