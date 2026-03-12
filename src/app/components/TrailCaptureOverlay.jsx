'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ─── TrailCaptureOverlay ──────────────────────────────────────────────────────
// Fixes in this version:
// 1. Toast uses position:fixed + zIndex 9999 so it appears ABOVE the navbar
// 2. "Saved Trails" panel fetches live from S3 and shows inside the designer
// 3. Load button lets you reload a saved trail's points back onto the map
// ─────────────────────────────────────────────────────────────────────────────

export default function TrailCaptureOverlay({
    captureMode, setCaptureMode,
    capturedPoints, setCapturedPoints,
    onClose, onTrailSaved,
}) {
    const router = useRouter();

    const [showSaveModal, setShowSaveModal]   = useState(false);
    const [formData, setFormData]             = useState({ name: '', description: '', category: 'General' });
    const [isSaving, setIsSaving]             = useState(false);
    const [saveError, setSaveError]           = useState(null);
    const [showToast, setShowToast]           = useState(false);

    // Saved trails list
    const [savedTrails, setSavedTrails]       = useState([]);
    const [trailsLoading, setTrailsLoading]   = useState(false);
    const [showTrailsList, setShowTrailsList] = useState(false);

    // ── Fetch saved trails from S3 ──────────────────────────────────────────
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

    // Load trails list on first open
    useEffect(() => { fetchSavedTrails(); }, [fetchSavedTrails]);

    const handleUndo  = () => setCapturedPoints(prev => prev.slice(0, -1));
    const handleClear = () => setCapturedPoints([]);

    // Load a saved trail's points back into the capture buffer
    const handleLoadTrail = (trail) => {
        if (!trail.points?.length) return;
        setCapturedPoints(trail.points);
        setShowTrailsList(false);
    };

    const handleOpenModal = () => {
        setSaveError(null);
        setFormData({ name: '', description: '', category: 'General' });
        setShowSaveModal(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) { setSaveError('Please enter a trail name.'); return; }
        setIsSaving(true);
        setSaveError(null);
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
                setCapturedPoints([]);
                setCaptureMode(false);
                if (onTrailSaved) onTrailSaved();
                fetchSavedTrails(); // refresh the in-panel list immediately

                // ✅ FIX: Toast is position:fixed + zIndex 9999 — beats the navbar (1100)
                setShowToast(true);
                setTimeout(() => { setShowToast(false); router.push('/'); }, 2200);
            } else {
                const body = await res.json().catch(() => ({}));
                setSaveError(body.error ?? `Server error ${res.status}`);
            }
        } catch (err) {
            setSaveError('Network error — check your connection.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            {/* ── Toast: fixed top-centre, zIndex 9999 beats the navbar ── */}
            {showToast && (
                <div style={{
                    position: 'fixed',
                    top: 'max(16px, env(safe-area-inset-top))',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 9999,
                    background: '#0f172a',
                    color: '#f1f5f9',
                    borderRadius: 14,
                    padding: '12px 22px',
                    display: 'flex', alignItems: 'center', gap: 10,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    fontSize: 14, fontWeight: 700,
                    whiteSpace: 'nowrap',
                    animation: 'toastIn 0.3s ease',
                    pointerEvents: 'none',
                }}>
                    <span style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: '#1BA39C',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, flexShrink: 0,
                    }}>✓</span>
                    Trail saved! Returning to map…
                </div>
            )}

            {/* ── Designer panel ── */}
            <div style={{
                background: 'white', padding: 15, borderRadius: 12,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)', border: '1px solid #ddd',
                display: 'flex', flexDirection: 'column', gap: 8,
            }}>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: 14, color: '#111' }}>Trail Designer</strong>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#888', lineHeight: 1 }}>✕</button>
                </div>

                {/* Record toggle */}
                <button onClick={() => setCaptureMode(!captureMode)} style={{
                    padding: '10px', borderRadius: 8, fontWeight: 700,
                    border: 'none', cursor: 'pointer',
                    background: captureMode ? '#d93025' : '#111', color: '#fff',
                }}>
                    {captureMode ? '⏹ Stop Recording' : '⏺ Start Recording'}
                </button>

                <p style={{ margin: 0, fontSize: 12, color: '#666', textAlign: 'center' }}>
                    {capturedPoints.length} point{capturedPoints.length !== 1 ? 's' : ''} captured
                </p>

                {/* Undo / Clear */}
                <div style={{ display: 'flex', gap: 6 }}>
                    {['Undo Last', 'Clear All'].map((label, i) => (
                        <button key={label} disabled={capturedPoints.length === 0}
                            onClick={i === 0 ? handleUndo : handleClear}
                            style={{
                                flex: 1, padding: '8px', borderRadius: 8,
                                border: '1px solid #ccc',
                                cursor: capturedPoints.length === 0 ? 'not-allowed' : 'pointer',
                                background: '#f5f5f5',
                                color: i === 0 ? '#333' : '#d93025',
                                fontWeight: 600, fontSize: 12,
                            }}>{label}</button>
                    ))}
                </div>

                {/* Save button */}
                <button onClick={handleOpenModal} disabled={capturedPoints.length === 0} style={{
                    padding: '12px', borderRadius: 8, fontWeight: 800, border: 'none',
                    cursor: capturedPoints.length === 0 ? 'not-allowed' : 'pointer',
                    background: capturedPoints.length === 0 ? '#ccc' : '#1BA39C',
                    color: '#fff',
                }}>
                    Save Trail to Cloud ({capturedPoints.length} pts)
                </button>

                <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '2px 0' }} />

                {/* Saved trails toggle */}
                <button onClick={() => setShowTrailsList(v => !v)} style={{
                    padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0',
                    background: '#f8fafc', color: '#475569', fontWeight: 700, fontSize: 12,
                    cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <span>📋 Saved Trails ({savedTrails.length})</span>
                    <span>{showTrailsList ? '▲' : '▼'}</span>
                </button>

                {/* ── Saved trails list ── */}
                {showTrailsList && (
                    <div style={{ maxHeight: 190, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {trailsLoading ? (
                            <p style={{ margin: '8px 0', fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>Loading…</p>
                        ) : savedTrails.length === 0 ? (
                            <p style={{ margin: '8px 0', fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>No trails saved yet</p>
                        ) : savedTrails.map(trail => (
                            <div key={trail.id} style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                background: '#f8fafc', borderRadius: 8,
                                border: '1px solid #e2e8f0', padding: '7px 10px',
                            }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {trail.name}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{trail.points?.length ?? 0} pts</div>
                                </div>
                                <button onClick={() => handleLoadTrail(trail)} style={{
                                    padding: '4px 10px', borderRadius: 6,
                                    border: '1px solid #1BA39C', background: '#f0fdfa',
                                    color: '#1BA39C', fontWeight: 700, fontSize: 11, cursor: 'pointer', flexShrink: 0,
                                }}>Load</button>
                            </div>
                        ))}
                        <button onClick={fetchSavedTrails} style={{
                            padding: '5px', background: 'none', border: 'none',
                            color: '#1BA39C', fontWeight: 700, fontSize: 11, cursor: 'pointer',
                        }}>↻ Refresh list</button>
                    </div>
                )}
            </div>

            {/* ── Save modal ── */}
            {showSaveModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 5000,
                }}>
                    <div style={{
                        background: '#fff', padding: 24, borderRadius: 16,
                        width: 320, boxShadow: '0 8px 40px rgba(0,0,0,0.25)', color: '#333',
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 16 }}>Save New Trail</h3>

                        <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                            Trail Name <span style={{ color: '#d93025' }}>*</span>
                        </label>
                        <input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Sports Block Loop"
                            style={{ width: '100%', padding: 8, marginBottom: 14, borderRadius: 6, border: '1px solid #ccc', boxSizing: 'border-box', fontSize: 13 }}
                        />

                        <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Briefly describe the route..."
                            rows={3}
                            style={{ width: '100%', padding: 8, marginBottom: 14, borderRadius: 6, border: '1px solid #ccc', boxSizing: 'border-box', fontSize: 13, resize: 'vertical' }}
                        />

                        {saveError && (
                            <p style={{ margin: '0 0 12px', fontSize: 12, color: '#d93025' }}>⚠ {saveError}</p>
                        )}

                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={handleSave} disabled={isSaving} style={{
                                flex: 1, padding: 10, background: isSaving ? '#aaa' : '#1BA39C',
                                color: '#fff', border: 'none', borderRadius: 8,
                                fontWeight: 700, cursor: isSaving ? 'not-allowed' : 'pointer', fontSize: 14,
                            }}>
                                {isSaving ? 'Saving…' : 'Save Trail'}
                            </button>
                            <button onClick={() => setShowSaveModal(false)} disabled={isSaving} style={{
                                flex: 1, padding: 10,
                                background: saveError ? '#1a73e8' : '#f1f5f9',
                                color: saveError ? '#fff' : '#333',
                                border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14,
                            }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes toastIn {
                    from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
                    to   { transform: translateX(-50%) translateY(0);     opacity: 1; }
                }
            `}</style>
        </>
    );
}