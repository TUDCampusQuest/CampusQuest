'use client';

const TEAL = '#1BA39C';

function trailLabel(key) {
    return key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
export default function TrailsPanel({
    trailPaths,
    selectedTrailName,
    setTrailInUrl,
    isAdmin,
    showCaptureUI,
    onToggleCaptureUI,
}) {
    const trailKeys = Object.keys(trailPaths);

    return (
        <div style={{
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            overflow: 'hidden',
        }}>
            {/* Header row */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 14px',
                borderBottom: '1px solid rgba(226,232,240,0.6)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{
                        width: 22, height: 22, borderRadius: 6,
                        background: 'linear-gradient(135deg, #1BA39C, #0e6d68)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, color: '#fff', flexShrink: 0,
                    }}>🗺</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#1e293b' }}>Trails</span>
                    {trailKeys.length > 0 && (
                        <span style={{
                            fontSize: 10, fontWeight: 700, color: TEAL,
                            background: '#f0fdfa', border: '1px solid #99f6e4',
                            borderRadius: 20, padding: '1px 7px',
                        }}>
                            {trailKeys.length}
                        </span>
                    )}
                </div>
            </div>

            {/* Trail list */}
            <div style={{
                padding: '8px 10px',
                display: 'flex', flexDirection: 'column', gap: 4,
                maxHeight: 220, overflowY: 'auto',
            }}>
                {trailKeys.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: '8px 0' }}>
                        No trails yet
                    </p>
                ) : trailKeys.map(key => {
                    const active = selectedTrailName === key;
                    return (
                        <button
                            key={key}
                            onClick={() => setTrailInUrl(key)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                width: '100%', padding: '8px 10px', borderRadius: 9,
                                border: 'none',
                                outline: active ? 'none' : '1px solid #e2e8f0',
                                background: active
                                    ? 'linear-gradient(135deg, #1BA39C, #15857f)'
                                    : 'rgba(248,250,252,0.8)',
                                color: active ? '#fff' : '#334155',
                                cursor: 'pointer',
                                fontWeight: active ? 700 : 500,
                                fontSize: 12, textAlign: 'left',
                                boxShadow: active ? '0 2px 8px rgba(27,163,156,0.3)' : 'none',
                                transition: 'all 0.15s',
                            }}
                        >
                            <span style={{
                                width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                                background: active ? 'rgba(255,255,255,0.85)' : TEAL,
                            }} />
                            {trailLabel(key)}
                        </button>
                    );
                })}

                {selectedTrailName && (
                    <button
                        onClick={() => setTrailInUrl(null)}
                        style={{
                            marginTop: 2, padding: '6px', borderRadius: 8,
                            border: '1px solid #fecaca', background: '#fef2f2',
                            color: '#dc2626', cursor: 'pointer', fontWeight: 700, fontSize: 11,
                        }}
                    >
                        ✕ Clear selection
                    </button>
                )}
            </div>

            {/* Trail Designer button — staff only */}
            {isAdmin && (
                <div style={{ padding: '0 10px 10px' }}>
                    <button
                        onClick={onToggleCaptureUI}
                        style={{
                            width: '100%', padding: '9px', borderRadius: 9,
                            border: 'none', cursor: 'pointer',
                            fontWeight: 700, fontSize: 12,
                            background: showCaptureUI
                                ? '#f1f5f9'
                                : 'linear-gradient(135deg, #0f172a, #1e293b)',
                            color: showCaptureUI ? '#475569' : '#fff',
                            boxShadow: showCaptureUI ? 'none' : '0 2px 8px rgba(0,0,0,0.18)',
                            transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: 6,
                        }}
                    >
                        <span>{showCaptureUI ? '←' : '✏'}</span>
                        {showCaptureUI ? 'Close Designer' : 'Trail Designer'}
                    </button>
                </div>
            )}
        </div>
    );
}