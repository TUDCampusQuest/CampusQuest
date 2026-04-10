'use client';

const TEAL = '#1BA39C';

function trailLabel(key) {
    return key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function TrailsPanel({
    trailPaths, selectedTrailName, setTrailInUrl,
    isAdmin, showCaptureUI, onToggleCaptureUI,
}) {
    const trailKeys = Object.keys(trailPaths);

    return (
        <div style={{
            background: 'rgba(15,23,42,0.75)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            minWidth: 200,
        }}>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                        width: 24, height: 24, borderRadius: 7,
                        background: 'linear-gradient(135deg, #1BA39C, #0e6d68)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, flexShrink: 0,
                    }}>🗺</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9', letterSpacing: '0.02em' }}>Trails</span>
                    {trailKeys.length > 0 && (
                        <span style={{
                            fontSize: 10, fontWeight: 700, color: TEAL,
                            background: 'rgba(27,163,156,0.15)',
                            border: '1px solid rgba(27,163,156,0.3)',
                            borderRadius: 20, padding: '1px 8px',
                        }}>
                            {trailKeys.length}
                        </span>
                    )}
                </div>
            </div>

            {/* Trail list */}
            <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 220, overflowY: 'auto' }}>
                {trailKeys.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '10px 0' }}>
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
                                width: '100%', padding: '8px 10px', borderRadius: 10,
                                border: active ? 'none' : '1px solid rgba(255,255,255,0.07)',
                                background: active
                                    ? 'linear-gradient(135deg, #1BA39C, #15857f)'
                                    : 'rgba(255,255,255,0.05)',
                                color: active ? '#fff' : 'rgba(255,255,255,0.75)',
                                cursor: 'pointer',
                                fontWeight: active ? 700 : 500,
                                fontSize: 12, textAlign: 'left',
                                boxShadow: active ? '0 2px 12px rgba(27,163,156,0.4)' : 'none',
                                transition: 'all 0.15s',
                            }}
                        >
                            <span style={{
                                width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                                background: active ? 'rgba(255,255,255,0.9)' : TEAL,
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
                            border: '1px solid rgba(239,68,68,0.3)',
                            background: 'rgba(239,68,68,0.1)',
                            color: '#f87171', cursor: 'pointer', fontWeight: 700, fontSize: 11,
                        }}
                    >
                        ✕ Clear selection
                    </button>
                )}
            </div>

            {/* Trail Designer button — staff only */}
            {isAdmin && (
                <div style={{ padding: '0 8px 8px' }}>
                    <button
                        onClick={onToggleCaptureUI}
                        style={{
                            width: '100%', padding: '9px', borderRadius: 10,
                            border: showCaptureUI ? '1px solid rgba(255,255,255,0.1)' : 'none',
                            cursor: 'pointer', fontWeight: 700, fontSize: 12,
                            background: showCaptureUI
                                ? 'rgba(255,255,255,0.07)'
                                : 'linear-gradient(135deg, #1BA39C, #0e6d68)',
                            color: showCaptureUI ? 'rgba(255,255,255,0.6)' : '#fff',
                            boxShadow: showCaptureUI ? 'none' : '0 2px 12px rgba(27,163,156,0.4)',
                            transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
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