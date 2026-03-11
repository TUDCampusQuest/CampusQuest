'use client';
import { useState } from 'react';

export default function TrailCaptureOverlay({
    captureMode, setCaptureMode, capturedPoints, setCapturedPoints, onClose
}) {
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', category: 'General' });
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    const handleUndo = () => setCapturedPoints((prev) => prev.slice(0, -1));
    const handleClear = () => setCapturedPoints([]);

    const handleOpenModal = () => {
        setSaveError(null);
        setFormData({ name: '', description: '', category: 'General' });
        setShowSaveModal(true);
    };

    const handleSaveToCloud = async () => {
        if (!formData.name.trim()) {
            setSaveError("Please enter a trail name.");
            return;
        }

        setIsSaving(true);
        setSaveError(null);

        try {
            const response = await fetch('/api/trails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    points: capturedPoints,
                    id: formData.name.trim().toLowerCase().replace(/\s+/g, '-'),
                }),
            });

            if (response.ok) {
                setShowSaveModal(false);
                setCapturedPoints([]);
                setCaptureMode(false);
            } else {
                const body = await response.json().catch(() => ({}));
                setSaveError(body.error ?? `Server error: ${response.status}`);
            }
        } catch (err) {
            console.error("Save error:", err);
            setSaveError("Network error — check your connection and try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{
            background: 'white', padding: 15, borderRadius: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)', border: '1px solid #ddd',
            display: 'flex', flexDirection: 'column', gap: 8
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <h3 style={{ margin: 0, fontSize: 14, color: '#111' }}>Trail Designer</h3>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#888' }}>✕</button>
            </div>

            {/* Record toggle */}
            <button
                onClick={() => setCaptureMode(!captureMode)}
                style={{
                    padding: '10px', borderRadius: 8, fontWeight: 700, border: 'none', cursor: 'pointer',
                    background: captureMode ? '#d93025' : '#111', color: '#fff',
                }}
            >
                {captureMode ? '⏹ Stop Recording' : '⏺ Start Recording'}
            </button>

            {/* Point count */}
            <p style={{ margin: 0, fontSize: 12, color: '#666', textAlign: 'center' }}>
                {capturedPoints.length} point{capturedPoints.length !== 1 ? 's' : ''} captured
            </p>

            {/* Undo / Clear */}
            <div style={{ display: 'flex', gap: 6 }}>
                <button
                    onClick={handleUndo}
                    disabled={capturedPoints.length === 0}
                    style={{
                        flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #ccc',
                        cursor: capturedPoints.length === 0 ? 'not-allowed' : 'pointer',
                        background: '#f5f5f5', color: '#333', fontWeight: 600, fontSize: 12,
                    }}
                >
                    Undo Last
                </button>
                <button
                    onClick={handleClear}
                    disabled={capturedPoints.length === 0}
                    style={{
                        flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #ccc',
                        cursor: capturedPoints.length === 0 ? 'not-allowed' : 'pointer',
                        background: '#f5f5f5', color: '#d93025', fontWeight: 600, fontSize: 12,
                    }}
                >
                    Clear All
                </button>
            </div>

            {/* Save to Cloud */}
            <button
                onClick={handleOpenModal}
                disabled={capturedPoints.length === 0}
                style={{
                    padding: '12px', borderRadius: 8, fontWeight: 800, border: 'none',
                    cursor: capturedPoints.length === 0 ? 'not-allowed' : 'pointer',
                    background: capturedPoints.length === 0 ? '#ccc' : '#1BA39C',
                    color: '#fff',
                }}
            >
                Save Trail to Cloud ({capturedPoints.length} pts)
            </button>

            {/* Save modal */}
            {showSaveModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                }}>
                    <div style={{
                        background: '#fff', padding: 24, borderRadius: 12,
                        width: 320, color: '#333', boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 16 }}>Save New Trail</h3>

                        <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                            Trail Name <span style={{ color: '#d93025' }}>*</span>
                        </label>
                        <input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Science Block Tour"
                            style={{
                                width: '100%', padding: 8, marginBottom: 12,
                                borderRadius: 6, border: '1px solid #ccc',
                                boxSizing: 'border-box', fontSize: 13,
                            }}
                        />

                        <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Briefly describe the route..."
                            rows={3}
                            style={{
                                width: '100%', padding: 8, marginBottom: 12,
                                borderRadius: 6, border: '1px solid #ccc',
                                boxSizing: 'border-box', fontSize: 13, resize: 'vertical',
                            }}
                        />

                        {saveError && (
                            <p style={{ margin: '0 0 12px', fontSize: 12, color: '#d93025' }}>
                                ⚠ {saveError}
                            </p>
                        )}

                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                onClick={handleSaveToCloud}
                                disabled={isSaving}
                                style={{
                                    flex: 1, padding: 10, background: isSaving ? '#aaa' : '#1BA39C',
                                    color: '#fff', border: 'none', borderRadius: 6,
                                    fontWeight: 700, cursor: isSaving ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {isSaving ? 'Saving…' : 'Confirm Save'}
                            </button>
                            <button
                                onClick={() => setShowSaveModal(false)}
                                disabled={isSaving}
                                style={{
                                    flex: 1, padding: 10,
                                    background: saveError ? '#1a73e8' : '#eee',
                                    color: saveError ? '#fff' : '#333',
                                    border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600,
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}