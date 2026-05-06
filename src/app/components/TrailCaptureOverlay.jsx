'use client';
// Admin-only overlay for recording, naming, and saving trail paths to S3.
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/TrailCaptureOverlay.module.css';

export default function TrailCaptureOverlay({
    captureMode, setCaptureMode,
    capturedPoints, setCapturedPoints,
    onClose, onTrailSaved,
}) {
    const router = useRouter();

    const [showSaveModal,  setShowSaveModal]  = useState(false);
    const [formData,       setFormData]        = useState({ name: '', description: '', category: 'General' });
    const [isSaving,       setIsSaving]        = useState(false);
    const [saveError,      setSaveError]       = useState(null);
    const [showToast,      setShowToast]       = useState(false);
    const [savedTrails,    setSavedTrails]     = useState([]);
    const [trailsLoading,  setTrailsLoading]   = useState(false);
    const [showTrailsList, setShowTrailsList]  = useState(false);

    const fetchSavedTrails = useCallback(async () => {
        setTrailsLoading(true);
        try {
            const res  = await fetch('/api/trails', { cache: 'no-store' });
            const data = await res.json();
            setSavedTrails(Array.isArray(data) ? data : []);
        } catch {
            setSavedTrails([]);
        } finally {
            setTrailsLoading(false);
        }
    }, []);

    useEffect(() => { fetchSavedTrails(); }, [fetchSavedTrails]);

    const handleUndo      = () => setCapturedPoints(prev => prev.slice(0, -1));
    const handleClear     = () => setCapturedPoints([]);
    const handleLoadTrail = (trail) => { if (trail.points?.length) { setCapturedPoints(trail.points); setShowTrailsList(false); } };

    const handleOpenModal = () => {
        setSaveError(null);
        setFormData({ name: '', description: '', category: 'General' });
        setShowSaveModal(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) { setSaveError('Please enter a trail name.'); return; }
        setIsSaving(true); setSaveError(null);
        try {
            const res = await fetch('/api/trails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    id: formData.name.trim().toLowerCase().replace(/\s+/g, '-'),
                    points: capturedPoints,
                }),
            });
            if (res.ok) {
                setShowSaveModal(false);
                setCapturedPoints([]); setCaptureMode(false);
                if (onTrailSaved) onTrailSaved();
                fetchSavedTrails();
                setShowToast(true);
                setTimeout(() => { setShowToast(false); router.push('/'); }, 2200);
            } else {
                const body = await res.json().catch(() => ({}));
                setSaveError(body.error ?? `Server error ${res.status}`);
            }
        } catch {
            setSaveError('Network error — check your connection.');
        } finally {
            setIsSaving(false);
        }
    };

    const hasPoints = capturedPoints.length > 0;

    return (
        <>
            {showToast && (
                <div className={styles.toast}>
                    <span className={styles.toastIcon}>✓</span>
                    Trail saved! Returning to map…
                </div>
            )}

            <div className={styles.panel}>
                <div className={styles.header}>
                    <span className={styles.headerTitle}>Trail Designer</span>
                    <button onClick={onClose} className={styles.closeBtn}>✕</button>
                </div>

                <button
                    onClick={() => setCaptureMode(!captureMode)}
                    className={styles.recordBtn}
                    style={{
                        background: captureMode
                            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                            : 'linear-gradient(135deg, #1BA39C, #0e6d68)',
                        boxShadow: captureMode ? '0 2px 12px rgba(239,68,68,0.4)' : '0 2px 12px rgba(27,163,156,0.4)',
                    }}
                >
                    {captureMode ? '⏹ Stop Recording' : '⏺ Start Recording'}
                </button>

                <p className={styles.pointCount}>
                    {capturedPoints.length} point{capturedPoints.length !== 1 ? 's' : ''} captured
                </p>

                <div className={styles.actionRow}>
                    <button onClick={handleUndo} disabled={!hasPoints} className={styles.actionBtn} style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                        Undo Last
                    </button>
                    <button onClick={handleClear} disabled={!hasPoints} className={`${styles.actionBtn} ${styles.clearBtn}`}>
                        Clear All
                    </button>
                </div>

                <button
                    onClick={handleOpenModal}
                    disabled={!hasPoints}
                    className={styles.saveBtn}
                    style={{
                        background: hasPoints ? 'linear-gradient(135deg, #1BA39C, #0e6d68)' : 'rgba(255,255,255,0.05)',
                        color: hasPoints ? '#fff' : 'rgba(255,255,255,0.25)',
                        cursor: hasPoints ? 'pointer' : 'not-allowed',
                        boxShadow: hasPoints ? '0 2px 12px rgba(27,163,156,0.4)' : 'none',
                    }}
                >
                    Save Trail to Cloud ({capturedPoints.length} pts)
                </button>

                <div className={styles.divider} />

                <button onClick={() => setShowTrailsList(v => !v)} className={styles.savedToggleBtn}>
                    <span>📋 Saved Trails ({savedTrails.length})</span>
                    <span className={styles.savedToggleChevron}>{showTrailsList ? '▲' : '▼'}</span>
                </button>

                {showTrailsList && (
                    <div className={styles.savedList}>
                        {trailsLoading ? (
                            <p className={styles.savedListMsg}>Loading…</p>
                        ) : savedTrails.length === 0 ? (
                            <p className={styles.savedListMsg}>No trails saved yet</p>
                        ) : savedTrails.map(trail => (
                            <div key={trail.id} className={styles.savedTrailRow}>
                                <div className={styles.savedTrailInfo}>
                                    <div className={styles.savedTrailName}>{trail.name}</div>
                                    <div className={styles.savedTrailPts}>{trail.points?.length ?? 0} pts</div>
                                </div>
                                <button onClick={() => handleLoadTrail(trail)} className={styles.loadBtn}>Load</button>
                            </div>
                        ))}
                        <button onClick={fetchSavedTrails} className={styles.refreshBtn}>↻ Refresh list</button>
                    </div>
                )}
            </div>

            {showSaveModal && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modal}>
                        <h3 className={styles.modalTitle}>Save New Trail</h3>

                        <label className={styles.fieldLabel}>
                            Trail Name <span className={styles.required}>*</span>
                        </label>
                        <input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Sports Block Loop"
                            className={styles.input}
                        />

                        <label className={styles.fieldLabel}>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Briefly describe the route..."
                            rows={3}
                            className={styles.textarea}
                        />

                        {saveError && <p className={styles.saveError}>⚠ {saveError}</p>}

                        <div className={styles.modalBtns}>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className={styles.modalSaveBtn}
                                style={{
                                    background: isSaving ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #1BA39C, #0e6d68)',
                                    cursor: isSaving ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {isSaving ? 'Saving…' : 'Save Trail'}
                            </button>
                            <button onClick={() => setShowSaveModal(false)} disabled={isSaving} className={styles.modalCancelBtn}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
