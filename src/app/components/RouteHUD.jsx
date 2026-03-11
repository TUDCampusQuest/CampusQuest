'use client';

/**
 * RouteHUD
 * The bottom overlay shown during navigation.
 * Renders the walking stats pill, the A→B building labels row,
 * and the "Change Start" / "Change Destination" reset buttons.
 *
 * Props:
 *   routeStep   — 'IDLE' | 'PICK_A' | 'ACTIVE' | 'ERROR'
 *   buildingA   — location object | null
 *   buildingB   — location object | null
 *   routeStats  — { metres: number, minutes: number } | null
 *   routeError  — string | null
 *   isChained   — boolean (true if route was stitched via a relay building)
 *   onChangeStart — () => void  resets to PICK_A
 */
export default function RouteHUD({
    routeStep,
    buildingA,
    buildingB,
    routeStats,
    routeError,
    isChained,
    onChangeStart,
}) {
    if (routeStep === 'IDLE') return null;

    const hudText = {
        PICK_A: '📍 Tap your START building on the map',
        ACTIVE: routeStats
            ? `🚶 ${routeStats.minutes} min · ${routeStats.metres} m${isChained ? ' (via connecting path)' : ''}`
            : 'Calculating route…',
        ERROR: routeError ?? 'No route available',
    }[routeStep] ?? '';

    return (
        <div style={{
            position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            pointerEvents: 'none', width: '90%', maxWidth: 440,
        }}>
            {/* ── Main pill ── */}
            <div style={{
                background: routeStep === 'ERROR' ? '#fef2f2' : '#0f172a',
                color: routeStep === 'ERROR' ? '#dc2626' : '#f1f5f9',
                borderRadius: 99, padding: '10px 22px', fontSize: 13, fontWeight: 700,
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                textAlign: 'center', pointerEvents: 'auto',
            }}>
                {hudText}
            </div>

            {/* ── A → B labels (only when route is active) ── */}
            {routeStep === 'ACTIVE' && buildingA && buildingB && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(255,255,255,0.97)', borderRadius: 12,
                    padding: '8px 16px', boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
                    fontSize: 12, fontWeight: 700, color: '#0f172a',
                    pointerEvents: 'auto',
                }}>
                    <Badge color="#22c55e">A</Badge>
                    <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {buildingA.name}
                    </span>
                    <span style={{ color: '#94a3b8' }}>→</span>
                    <Badge color="#ef4444">B</Badge>
                    <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {buildingB.name}
                    </span>
                </div>
            )}

            {/* ── Reset buttons ── */}
            {(routeStep === 'ACTIVE' || routeStep === 'ERROR') && (
                <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>
                    <button
                        onClick={onChangeStart}
                        style={{
                            padding: '7px 16px', borderRadius: 99, border: 'none',
                            background: '#fff', color: '#0f172a',
                            fontWeight: 700, fontSize: 12, cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        }}
                    >
                        ↺ Change Start
                    </button>
                </div>
            )}
        </div>
    );
}

// Small coloured circle badge — A or B
function Badge({ color, children }) {
    return (
        <span style={{
            background: color, color: '#fff',
            borderRadius: '50%', width: 20, height: 20,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 900, flexShrink: 0,
        }}>
            {children}
        </span>
    );
}