'use client';
// Trails listing page: browse, filter by category, and launch campus trails on the map.
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { buildTrailPath, calcTrailDistance } from '../lib/trailRouter';
import useIndoorData from '../hooks/useIndoorData';
import TrailCard, { CATEGORY_TABS } from '../components/TrailCard';
import styles from '../styles/trails.module.css';

function useIsAdmin() {
    const [isAdmin, setIsAdmin] = useState(false);
    useEffect(() => {
        setIsAdmin(sessionStorage.getItem('cq_staff') === 'true');
    }, []);
    return isAdmin;
}

export default function TrailsPage() {
    const router = useRouter();
    const { campusGraph } = useIndoorData();

    const [trails, setTrails]       = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const isAdmin = useIsAdmin();

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

    const filtered = activeTab === 'all' ? trails : trails.filter(t => t.category?.toLowerCase() === activeTab);

    function buildAndStore(trail, key) {
        // Trails from the designer have raw `points` but no `stops`.
        // Fall back to the raw coordinate array as the path so they render on the map.
        let path;
        if (trail.stops?.length >= 2) {
            path = buildTrailPath(trail.stops, campusGraph);
        } else if (trail.points?.length >= 2) {
            path = trail.points;
        } else {
            path = [];
        }
        const distance = calcTrailDistance(path);
        localStorage.setItem(key, JSON.stringify({ ...trail, computedPath: path, computedDistance: distance }));
        router.push('/');
    }

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <button className={styles.backBtn} onClick={() => router.push('/')}>
                    ← Map
                </button>
            </div>

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
                        <div className={styles.emptyHint}>
                            {isAdmin
                                ? 'Open the Trail Designer on the map to record your first trail.'
                                : 'Check back soon — trails will appear here once they\'ve been added.'}
                        </div>
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

                {!loading && isAdmin && (
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
