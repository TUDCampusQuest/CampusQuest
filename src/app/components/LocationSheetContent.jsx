'use client';

const TEAL = '#1BA39C';

function Btn({ label, onClick, primary }) {
    return (
        <button
            onClick={onClick}
            style={{
                flex: primary ? 2 : 1,
                padding: '13px 10px',
                borderRadius: 13,
                border: primary ? 'none' : '1px solid rgba(255,255,255,0.13)',
                background: primary
                    ? 'linear-gradient(135deg,#1BA39C,#0e6d68)'
                    : 'rgba(255,255,255,0.06)',
                color: '#fff',
                fontSize: 14,
                fontWeight: primary ? 800 : 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: primary ? '0 4px 16px rgba(27,163,156,0.4)' : 'none',
                transition: 'opacity 0.15s',
                letterSpacing: primary ? '0.02em' : 0,
            }}
        >
            {label}
        </button>
    );
}

export default function LocationSheetContent({
    location, onClose, onNavigate, onSetAsStart, onViewDetails, isMobile,
}) {
    if (!location) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

            {/* Hero image */}
            <div style={{
                position: 'relative', flexShrink: 0,
                height: isMobile ? 145 : 200,
                background: '#0a1628', overflow: 'hidden',
            }}>
                {location.image ? (
                    <img
                        src={location.image}
                        alt={location.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,rgba(27,163,156,0.15),#0a1628)' }} />
                )}

                {/* Gradient overlay so text below is readable */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(0,0,0,0.05) 0%,rgba(15,23,42,0.65) 100%)' }} />

                {/* Close */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: 10, right: 10,
                        width: 30, height: 30, borderRadius: '50%',
                        background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#fff', cursor: 'pointer', fontSize: 18,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        lineHeight: 1,
                    }}
                >×</button>

                {/* Building badge */}
                <span style={{
                    position: 'absolute', bottom: 10, left: 12,
                    background: TEAL, color: '#fff',
                    fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
                    padding: '3px 9px', borderRadius: 20,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}>{location.id}</span>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 8px' }}>
                <div style={{ fontWeight: 900, fontSize: 20, color: '#f1f5f9', lineHeight: 1.2, marginBottom: 6 }}>
                    {location.name}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.58)', lineHeight: 1.65 }}>
                    {location.description}
                </div>

                <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '12px 0' }} />

                {location.floors?.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                            background: 'rgba(27,163,156,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                        }}>🏢</div>
                        <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Floors
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>
                                {location.floors.join(', ')}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div style={{
                flexShrink: 0,
                padding: '10px 14px',
                paddingBottom: isMobile ? 'max(14px, env(safe-area-inset-bottom))' : 16,
                borderTop: '1px solid rgba(255,255,255,0.08)',
            }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Btn label="View Details" onClick={onViewDetails} />
                    {onSetAsStart && <Btn label="Set as Start" onClick={onSetAsStart} />}
                    <Btn label="▲ Navigate" onClick={onNavigate} primary />
                </div>
            </div>
        </div>
    );
}
