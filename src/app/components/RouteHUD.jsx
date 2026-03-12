'use client';

/**
 * RouteHUD — bottom overlay during navigation
 * Shows walking stats, A→B building labels, and Change Start button
 */
export default function RouteHUD({ routeStep, buildingA, buildingB, routeStats, routeError, isChained, onChangeStart }) {
    if (routeStep === 'IDLE') return null;

    const isError  = routeStep === 'ERROR';
    const isActive = routeStep === 'ACTIVE';
    const isPickA  = routeStep === 'PICK_A';

    const pillText = isPickA  ? '📍 Tap your start building on the map'
                   : isActive ? routeStats
                        ? `🚶 ${routeStats.minutes} min  ·  ${routeStats.metres} m${isChained ? '  (via relay)' : ''}`
                        : 'Calculating route…'
                   : isError  ? (routeError ?? 'No route available')
                   : '';

    return (
        <div style={{
            position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            width: '90%', maxWidth: 440, pointerEvents: 'none',
        }}>

            {/* ── Stats / instruction pill ── */}
            <div style={{
                padding: '11px 24px',
                borderRadius: 99,
                fontWeight: 700, fontSize: 13,
                textAlign: 'center',
                pointerEvents: 'auto',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
                ...(isError ? {
                    background: 'rgba(254,242,242,0.97)',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                } : isPickA ? {
                    background: 'rgba(240,253,250,0.97)',
                    color: '#0f766e',
                    border: '1px solid #99f6e4',
                } : {
                    background: 'rgba(15,23,42,0.92)',
                    color: '#f1f5f9',
                    border: 'none',
                }),
            }}>
                {pillText}
            </div>

            {/* ── A → B card ── */}
            {isActive && buildingA && buildingB && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(255,255,255,0.97)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: 12, padding: '9px 16px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    fontSize: 12, fontWeight: 600, color: '#0f172a',
                    pointerEvents: 'auto',
                }}>
                    <Badge bg="#22c55e">A</Badge>
                    <span style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {buildingA.name}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: 14 }}>→</span>
                    <Badge bg="#ef4444">B</Badge>
                    <span style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {buildingB.name}
                    </span>
                </div>
            )}

            {/* ── Change start button ── */}
            {(isActive || isError) && (
                <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>
                    <button onClick={onChangeStart} style={{
                        padding: '8px 20px', borderRadius: 99,
                        border: '1px solid #e2e8f0',
                        background: 'rgba(255,255,255,0.97)',
                        backdropFilter: 'blur(8px)',
                        color: '#0f172a', fontWeight: 700, fontSize: 12,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'all 0.15s',
                    }}>
                        ↺  Change Start
                    </button>
                </div>
            )}
        </div>
    );
}

function Badge({ bg, children }) {
    return (
        <span style={{
            background: bg, color: '#fff', borderRadius: '50%',
            width: 20, height: 20, display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 900, flexShrink: 0,
            boxShadow: `0 1px 4px ${bg}55`,
        }}>
            {children}
        </span>
    );
}