'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function TrailCaptureOverlay({
    captureMode, setCaptureMode,
    capturedPoints, setCapturedPoints,
    onClose, onTrailSaved,
}) {
    const router = useRouter();

    const [showSaveModal,   setShowSaveModal]   = useState(false);
    const [formData,        setFormData]         = useState({ name: '', description: '', category: 'General' });
    const [isSaving,        setIsSaving]         = useState(false);
    const [saveError,       setSaveError]        = useState(null);
    const [showToast,       setShowToast]        = useState(false);
    const [savedTrails,     setSavedTrails]      = useState([]);
    const [trailsLoading,   setTrailsLoading]    = useState(false);
    const [showTrailsList,  setShowTrailsList]   = useState(false);

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

    const btn = (label, onClick, opts = {}) => (
        <button onClick={onClick} disabled={opts.disabled} style={{
            padding: opts.pad ?? '9px 12px',
            borderRadius: 10, border: opts.border ?? 'none',
            cursor: opts.disabled ? 'not-allowed' : 'pointer',
            fontWeight: 700, fontSize: 12,
            background: opts.bg ?? 'rgba(255,255,255,0.08)',
            color: opts.color ?? 'rgba(255,255,255,0.8)',
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            opacity: opts.disabled ? 0.4 : 1,
            boxShadow: opts.shadow ?? 'none',
            ...opts.extra,
        }}>
            {label}
        </button>
    );

    return (
        <>
            {showToast && (
                <div style={{
                    position: 'fixed',
                    top: 'max(16px, env(safe-area-inset-top))',
                    left: '50%', transform: 'translateX(-50%)',
                    zIndex: 9999,
                    background: '#0f172a', color: '#f1f5f9',
                    borderRadius: 14, padding: '12px 22px',
                    display: 'flex', alignItems: 'center', gap: 10,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap',
                    animation: 'toastIn 0.3s ease', pointerEvents: 'none',
                }}>
                    <span style={{
                        width: 24, height: 24, borderRadius: '50%', background: '#1BA39C',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, flexShrink: 0,
                    }}>✓</span>
                    Trail saved! Returning to map…
                </div>
            )}

            {/* Designer panel */}
            <div style={{
                background: 'rgba(15,23,42,0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                padding: 12,
                display: 'flex', flexDirection: 'column', gap: 8,
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9' }}>Trail Designer</span>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer',
                        fontSize: 14, color: 'rgba(255,255,255,0.5)', borderRadius: 8,
                        width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>✕</button>
                </div>

                {/* Record button */}
                <button onClick={() => setCaptureMode(!captureMode)} style={{
                    padding: '10px', borderRadius: 10, fontWeight: 700, fontSize: 12,
                    border: 'none', cursor: 'pointer',
                    background: captureMode
                        ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                        : 'linear-gradient(135deg, #1BA39C, #0e6d68)',
                    color: '#fff',
                    boxShadow: captureMode ? '0 2px 12px rgba(239,68,68,0.4)' : '0 2px 12px rgba(27,163,156,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                    {captureMode ? '⏹ Stop Recording' : '⏺ Start Recording'}
                </button>

                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                    {capturedPoints.length} point{capturedPoints.length !== 1 ? 's' : ''} captured
                </p>

                {/* Undo / Clear */}
                <div style={{ display: 'flex', gap: 6 }}>
                    {btn('Undo Last', handleUndo, { disabled: capturedPoints.length === 0, extra: { flex: 1 }, border: '1px solid rgba(255,255,255,0.1)' })}
                    {btn('Clear All', handleClear, { disabled: capturedPoints.length === 0, extra: { flex: 1 }, color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', bg: 'rgba(239,68,68,0.08)' })}
                </div>

                {/* Save button */}
                <button onClick={handleOpenModal} disabled={capturedPoints.length === 0} style={{
                    padding: '10px', borderRadius: 10, fontWeight: 700, fontSize: 12, border: 'none',
                    cursor: capturedPoints.length === 0 ? 'not-allowed' : 'pointer',
                    background: capturedPoints.length === 0 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #1BA39C, #0e6d68)',
                    color: capturedPoints.length === 0 ? 'rgba(255,255,255,0.25)' : '#fff',
                    boxShadow: capturedPoints.length === 0 ? 'none' : '0 2px 12px rgba(27,163,156,0.4)',
                }}>
                    Save Trail to Cloud ({capturedPoints.length} pts)
                </button>

                <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '2px 0' }} />

                {/* Saved trails toggle */}
                <button onClick={() => setShowTrailsList(v => !v)} style={{
                    padding: '8px 10px', borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: 12,
                    cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <span>📋 Saved Trails ({savedTrails.length})</span>
                    <span style={{ fontSize: 10 }}>{showTrailsList ? '▲' : '▼'}</span>
                </button>

                {showTrailsList && (
                    <div style={{ maxHeight: 190, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {trailsLoading ? (
                            <p style={{ margin: '8px 0', fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>Loading…</p>
                        ) : savedTrails.length === 0 ? (
                            <p style={{ margin: '8px 0', fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>No trails saved yet</p>
                        ) : savedTrails.map(trail => (
                            <div key={trail.id} style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                background: 'rgba(255,255,255,0.05)', borderRadius: 10,
                                border: '1px solid rgba(255,255,255,0.07)', padding: '7px 10px',
                            }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {trail.name}
                                    </div>
                                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{trail.points?.length ?? 0} pts</div>
                                </div>
                                <button onClick={() => handleLoadTrail(trail)} style={{
                                    padding: '4px 10px', borderRadius: 7,
                                    border: '1px solid rgba(27,163,156,0.4)',
                                    background: 'rgba(27,163,156,0.12)',
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

            {/* Save modal */}
            {showSaveModal && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 5000,
                }}>
                    <div style={{
                        background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: 24, borderRadius: 18,
                        width: 320, boxShadow: '0 24px 60px rgba(0,0,0,0.5)', color: '#f1f5f9',
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 15, color: '#f1f5f9' }}>Save New Trail</h3>

                        <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Trail Name <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Sports Block Loop"
                            style={{
                                width: '100%', padding: '9px 12px', marginBottom: 14,
                                borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)',
                                boxSizing: 'border-box', fontSize: 13,
                                background: 'rgba(255,255,255,0.06)', color: '#f1f5f9',
                                outline: 'none', fontFamily: 'inherit',
                            }}
                        />

                        <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Briefly describe the route..."
                            rows={3}
                            style={{
                                width: '100%', padding: '9px 12px', marginBottom: 14,
                                borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)',
                                boxSizing: 'border-box', fontSize: 13, resize: 'vertical',
                                background: 'rgba(255,255,255,0.06)', color: '#f1f5f9',
                                outline: 'none', fontFamily: 'inherit',
                            }}
                        />

                        {saveError && (
                            <p style={{ margin: '0 0 12px', fontSize: 12, color: '#f87171' }}>⚠ {saveError}</p>
                        )}

                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={handleSave} disabled={isSaving} style={{
                                flex: 1, padding: 10,
                                background: isSaving ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #1BA39C, #0e6d68)',
                                color: '#fff', border: 'none', borderRadius: 10,
                                fontWeight: 700, cursor: isSaving ? 'not-allowed' : 'pointer', fontSize: 13,
                            }}>
                                {isSaving ? 'Saving…' : 'Save Trail'}
                            </button>
                            <button onClick={() => setShowSaveModal(false)} disabled={isSaving} style={{
                                flex: 1, padding: 10,
                                background: 'rgba(255,255,255,0.07)',
                                color: 'rgba(255,255,255,0.6)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13,
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