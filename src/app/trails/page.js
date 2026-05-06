'use client';
// Trails listing page: browse, filter by category, and launch campus trails on the map.
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { buildTrailPath, calcTrailDistance } from '../lib/trailRouter';
import useIndoorData from '../hooks/useIndoorData';
import TrailCard, { CATEGORY_TABS } from '../components/TrailCard';
import styles from '../styles/trails.module.css';

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
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Campus Trails</h1>
                <p className={styles.pageSubtitle}>Explore TUD Blanchardstown your way</p>
            </div>

            <div className={styles.tabRow}>
                {CATEGORY_TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={styles.tabBtn}
                        style={{
                            border: activeTab === tab.key ? 'none' : '1px solid var(--border-color)',
                            background: activeTab === tab.key ? 'var(--accent-purple)' : 'var(--bg-card)',
                            color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
                        }}
                    >
                        {tab.emoji} {tab.label}
                    </button>
                ))}
            </div>

            <div className={styles.cardList}>

                {loading && <div className={styles.loadingText}>Loading trails...</div>}

                {!loading && error && <div className={styles.errorBox}>⚠ {error}</div>}

                {!loading && !error && trails.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🗺️</div>
                        <div className={styles.emptyTitle}>No trails saved yet</div>
                        <div className={styles.emptyHint}>Open the Trail Designer on the map to record your first trail.</div>
                    </div>
                )}

                {!loading && !error && trails.length > 0 && filtered.length === 0 && (
                    <div className={styles.filterEmpty}>No {activeTab} trails yet.</div>
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
                    <div className={styles.createBanner}>
                        <div className={styles.createTitle}>Create Your Own Trail</div>
                        <div className={styles.createSubtitle}>Add stops, name it, share with others</div>
                        <button onClick={() => router.push('/')} className={styles.createBtn}>
                            Open Trail Designer
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
