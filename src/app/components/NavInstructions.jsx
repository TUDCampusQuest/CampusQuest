'use client';

import { useState, useMemo } from 'react';

const TEAL = '#1BA39C';

function haversineM(a, b) {
    const R = 6371000;
    const r = d => d * Math.PI / 180;
    const dLat = r(b[1] - a[1]);
    const dLng = r(b[0] - a[0]);
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(r(a[1])) * Math.cos(r(b[1])) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function getBearing(a, b) {
    const r = d => d * Math.PI / 180;
    const dLng = r(b[0] - a[0]);
    const y = Math.sin(dLng) * Math.cos(r(b[1]));
    const x = Math.cos(r(a[1])) * Math.sin(r(b[1])) - Math.sin(r(a[1])) * Math.cos(r(b[1])) * Math.cos(dLng);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function bearingToLabel(deg) {
    const dirs = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
    return dirs[Math.round(deg / 45) % 8];
}

function fmtDist(m) {
    return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
}

function deriveSteps(coords) {
    if (!coords || coords.length < 2) return [];
    const steps = [];
    let accumulated = 0;
    let groupBearing = getBearing(coords[0], coords[1]);

    for (let i = 1; i < coords.length; i++) {
        const dist = haversineM(coords[i - 1], coords[i]);
        const bearing = i < coords.length - 1
            ? getBearing(coords[i - 1], coords[i])
            : groupBearing;

        const diff = Math.abs(bearing - groupBearing);
        const turn = diff > 180 ? 360 - diff : diff;

        if (turn > 28 && accumulated > 8) {
            steps.push({ metres: Math.round(accumulated), dir: bearingToLabel(groupBearing) });
            accumulated = dist;
            groupBearing = bearing;
        } else {
            accumulated += dist;
        }
    }
    if (accumulated > 1) {
        steps.push({ metres: Math.round(accumulated), dir: bearingToLabel(groupBearing) });
    }
    return steps;
}

function Toggle({ label, checked, onChange }) {
    return (
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
            <div
                onClick={() => onChange(!checked)}
                style={{
                    width: 38, height: 22, borderRadius: 99,
                    background: checked ? TEAL : 'rgba(255,255,255,0.15)',
                    position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                }}
            >
                <div style={{
                    position: 'absolute', top: 3, left: checked ? 18 : 3,
                    width: 16, height: 16, borderRadius: '50%',
                    background: '#fff', transition: 'left 0.2s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }} />
            </div>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{label}</span>
        </label>
    );
}

function StepRow({ index, metres, dir, isLast }) {
    const mins = Math.max(1, Math.ceil(metres / 80));
    return (
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            {/* Timeline dot + line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                    width: 10, height: 10, borderRadius: '50%', marginTop: 3,
                    background: isLast ? '#ef4444' : TEAL,
                    boxShadow: `0 0 0 3px ${isLast ? 'rgba(239,68,68,0.2)' : 'rgba(27,163,156,0.25)'}`,
                }} />
                {!isLast && (
                    <div style={{ width: 2, flex: 1, minHeight: 24, background: 'rgba(255,255,255,0.12)', marginTop: 4 }} />
                )}
            </div>

            {/* Content */}
            <div style={{ paddingBottom: isLast ? 0 : 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.3 }}>
                    🚶 Walk {fmtDist(metres)}
                    <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}> · heading {dir}</span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                    ~{mins} min
                </div>
            </div>
        </div>
    );
}

export default function NavInstructions({
    routeStep, routeStats, routeCoords,
    buildingA, buildingB, routeError,
    onChangeStart,
}) {
    const [avoidStairs, setAvoidStairs] = useState(false);
    const steps = useMemo(() => deriveSteps(routeCoords), [routeCoords]);

    if (routeStep === 'IDLE') return null;

    const isPickA  = routeStep === 'PICK_A';
    const isActive = routeStep === 'ACTIVE';
    const isError  = routeStep === 'ERROR';

    /* PICK_A: simple pill prompt */
    if (isPickA) {
        return (
            <div style={{
                position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                zIndex: 20, background: 'rgba(240,253,250,0.97)', backdropFilter: 'blur(10px)',
                borderRadius: 99, padding: '11px 24px',
                border: '1px solid #99f6e4', color: '#0f766e',
                fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap',
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            }}>
                📍 Tap your start building on the map
            </div>
        );
    }

    /* ERROR */
    if (isError) {
        return (
            <div style={{
                position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                width: '90%', maxWidth: 400,
            }}>
                <div style={{
                    padding: '11px 24px', borderRadius: 99, fontWeight: 700, fontSize: 13,
                    background: 'rgba(254,242,242,0.97)', color: '#dc2626',
                    border: '1px solid #fecaca', backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                }}>{routeError ?? 'No route available'}</div>
                <button onClick={onChangeStart} style={{
                    padding: '8px 20px', borderRadius: 99, border: '1px solid #e2e8f0',
                    background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(8px)',
                    color: '#0f172a', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}>↺ Change Start</button>
            </div>
        );
    }

    /* ACTIVE: full instructions panel */
    return (
        <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
            background: 'rgba(15,23,42,0.88)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none',
            borderRadius: '20px 20px 0 0',
            boxShadow: '0 -6px 30px rgba(0,0,0,0.4)',
            maxHeight: '42dvh', display: 'flex', flexDirection: 'column',
        }}>
            {/* Header: summary + change start */}
            <div style={{
                flexShrink: 0, padding: '14px 16px 10px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9', lineHeight: 1.1 }}>
                        {routeStats ? `${routeStats.minutes} min` : '…'}
                    </div>
                    {routeStats && (
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                            {fmtDist(routeStats.metres)}
                            {buildingA && buildingB && (
                                <span> · {buildingA.name} → {buildingB.name}</span>
                            )}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <Toggle label="Avoid stairs" checked={avoidStairs} onChange={setAvoidStairs} />
                    <button onClick={onChangeStart} style={{
                        padding: '6px 14px', borderRadius: 99,
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.07)',
                        color: '#f1f5f9', fontWeight: 700, fontSize: 11, cursor: 'pointer',
                    }}>↺ Change Start</button>
                </div>
            </div>

            {/* Step-by-step list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
                {!routeStats ? (
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center' }}>
                        Calculating route…
                    </div>
                ) : steps.length === 0 ? (
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center' }}>
                        Follow the highlighted path on the map.
                    </div>
                ) : (
                    steps.map((s, i) => (
                        <StepRow
                            key={i}
                            index={i}
                            metres={s.metres}
                            dir={s.dir}
                            isLast={i === steps.length - 1}
                        />
                    ))
                )}
                {avoidStairs && (
                    <div style={{
                        marginTop: 10, padding: '8px 10px', borderRadius: 10,
                        background: 'rgba(27,163,156,0.12)', border: '1px solid rgba(27,163,156,0.25)',
                        fontSize: 11, color: TEAL, fontWeight: 600,
                    }}>
                        ♿ Stair-free routing coming soon — route shown is the shortest path.
                    </div>
                )}
            </div>
        </div>
    );
}
