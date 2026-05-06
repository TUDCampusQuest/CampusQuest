'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { buildTrailPath, calcTrailDistance } from '../lib/trailRouter';
import useIndoorData from '../hooks/useIndoorData';
import TrailCard, { CATEGORY_TABS } from '../components/TrailCard';

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

    const filtered = activeTab === 'all' ? trails : trails.filter(t => t.category === activeTab);

    function buildAndStore(trail, key) {
        const path     = buildTrailPath(trail.stops ?? [], campusGraph);
        const distance = calcTrailDistance(path);
        localStorage.setItem(key, JSON.stringify({ ...trail, computedPath: path, computedDistance: distance }));
        router.push('/');
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            overflowY: 'auto',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 20px))',
        }}>
            <div style={{ padding: '20px 16px 0' }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Campus Trails
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                    Explore TUD Blanchardstown your way
                </p>
            </div>

            {/* Category tabs */}
            <div style={{
                display: 'flex', gap: 8, overflowX: 'auto',
                padding: '16px 16px', scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch',
            }}>
                <style>{`
                    .trail-card-btn { transition: opacity 0.15s; }
                    .trail-card-btn:hover { opacity: 0.85; }
                    .trail-card-btn:active { opacity: 0.7; }
                `}</style>
                {CATEGORY_TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            flexShrink: 0, padding: '8px 16px', borderRadius: 20,
                            border: activeTab === tab.key ? 'none' : '1px solid var(--border-color)',
                            background: activeTab === tab.key ? 'var(--accent-purple)' : 'var(--bg-card)',
                            color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
                            fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                        }}
                    >
                        {tab.emoji} {tab.label}
                    </button>
                ))}
            </div>

            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)', fontSize: 14 }}>
                        Loading trails...
                    </div>
                )}

                {!loading && error && (
                    <div style={{
                        background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)',
                        borderRadius: 14, padding: 16, color: '#ef4444', fontSize: 14, fontWeight: 600,
                    }}>
                        ⚠ {error}
                    </div>
                )}

                {!loading && !error && trails.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
                        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 6 }}>No trails saved yet</div>
                        <div style={{ fontSize: 13 }}>Open the Trail Designer on the map to record your first trail.</div>
                    </div>
                )}

                {!loading && !error && trails.length > 0 && filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)', fontSize: 14 }}>
                        No {activeTab} trails yet.
                    </div>
                )}

                {!loading && !error && filtered.map(trail => (
                    <TrailCard
                        key={trail.id}
                        trail={trail}
                        onView={() => buildAndStore(trail, 'activeTrail')}
                        onStart={() => buildAndStore(trail, 'startTrail')}
                    />
                ))}

                {!loading && (
                    <div style={{
                        background: 'linear-gradient(135deg, var(--accent-purple), #4F46E5)',
                        padding: 20, borderRadius: 16, marginTop: 4,
                    }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                            Create Your Own Trail
                        </div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 12 }}>
                            Add stops, name it, share with others
                        </div>
                        <button
                            onClick={() => router.push('/')}
                            style={{
                                background: '#fff', color: 'var(--accent-purple)',
                                border: 'none', borderRadius: 10, padding: '10px 20px',
                                fontWeight: 700, fontSize: 13, cursor: 'pointer',
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
