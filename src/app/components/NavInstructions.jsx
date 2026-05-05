'use client';

import { useState, useMemo } from 'react';
import { getRoomDisplayName } from '../lib/roomUtils';
import { deriveSteps, fmtDist } from '../lib/routeUtils';

const ROOM_CODE_RE = /[A-Z]{2}-\d{3}[A-Z]?$/;

function resolveStepDesc(description, roomNameMap) {
    if (!roomNameMap || !description) return description;
    const match = description.match(ROOM_CODE_RE);
    if (!match) return description;
    const code = match[0];
    const name = getRoomDisplayName(code, roomNameMap);
    if (name === code) return description;
    return description.slice(0, description.length - code.length) + name;
}

const TEAL = '#1BA39C';
const INDOOR_TEAL = '#00B4B4';

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

function OutdoorStepRow({ metres, dir, isLast }) {
    const mins = Math.max(1, Math.ceil(metres / 80));
    return (
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
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

// ─── indoor step row ─────────────────────────────────────────────────────────

const STEP_ICON = {
    walk:           '🚶',
    stairs_up:      '⬆️',
    stairs_down:    '⬇️',
    enter_building: '🚪',
    exit_building:  '🏃',
    arrived:        '✅',
};

function IndoorStepRow({ step, isActive, isLast }) {
    const dist = fmtDist(step.metres);
    return (
        <div style={{
            display: 'flex', gap: 12, alignItems: 'flex-start',
            borderLeft: `3px solid ${isActive ? INDOOR_TEAL : 'transparent'}`,
            paddingLeft: 10,
            paddingBottom: isLast ? 0 : 14,
            transition: 'border-color 0.2s',
        }}>
            {/* Timeline dot */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                    width: 10, height: 10, borderRadius: '50%', marginTop: 3,
                    background: isActive ? INDOOR_TEAL : (step.type === 'arrived' ? '#22c55e' : 'rgba(255,255,255,0.2)'),
                    boxShadow: isActive ? `0 0 0 3px rgba(0,180,180,0.25)` : 'none',
                    transition: 'background 0.2s',
                }} />
                {!isLast && (
                    <div style={{ width: 2, flex: 1, minHeight: 20, background: 'rgba(255,255,255,0.1)', marginTop: 4 }} />
                )}
            </div>

            {/* Content */}
            <div style={{ paddingBottom: 0 }}>
                <div style={{
                    fontSize: 13,
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? '#f1f5f9' : 'rgba(255,255,255,0.65)',
                    lineHeight: 1.35,
                    transition: 'color 0.2s',
                }}>
                    <span style={{ marginRight: 6 }}>{STEP_ICON[step.type] ?? '•'}</span>
                    {step.description}
                </div>
                {dist && (
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>
                        {dist}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── main export ─────────────────────────────────────────────────────────────

export default function NavInstructions({
    routeStep, routeStats, routeCoords,
    buildingA, buildingB, routeError,
    onChangeStart,
    activeRoute, currentStepIndex,
    onIndoorChangeStart,
    roomNameMap,
}) {
    const [avoidStairs, setAvoidStairs] = useState(false);
    const outdoorSteps = useMemo(() => deriveSteps(routeCoords), [routeCoords]);

    // ── indoor panel — takes priority ──────────────────────────────────────
    if (activeRoute?.steps?.length > 0) {
        return (
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
                background: 'rgba(15,23,42,0.92)',
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none',
                borderRadius: '20px 20px 0 0',
                boxShadow: '0 -6px 30px rgba(0,0,0,0.4)',
                maxHeight: '42dvh', display: 'flex', flexDirection: 'column',
            }}>
                {/* Header */}
                <div style={{
                    flexShrink: 0, padding: '14px 16px 10px',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div>
                        <div style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9', lineHeight: 1.1 }}>
                            {activeRoute.totalMinutes} min
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                            {fmtDist(activeRoute.totalMetres)}
                            {activeRoute.requiresStairs && ' · Stairs required'}
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                        <div style={{
                            fontSize: 10, fontWeight: 700, color: INDOOR_TEAL,
                            background: 'rgba(0,180,180,0.15)',
                            border: '1px solid rgba(0,180,180,0.3)',
                            borderRadius: 20, padding: '3px 10px',
                            letterSpacing: '0.07em', textTransform: 'uppercase',
                        }}>
                            Indoor
                        </div>
                        {onIndoorChangeStart && (
                            <button onClick={onIndoorChangeStart} style={{
                                padding: '6px 14px', borderRadius: 99,
                                border: '1px solid rgba(255,255,255,0.15)',
                                background: 'rgba(255,255,255,0.07)',
                                color: '#f1f5f9', fontWeight: 700, fontSize: 11, cursor: 'pointer',
                            }}>↺ Change Start</button>
                        )}
                    </div>
                </div>

                {/* Step list */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
                    {activeRoute.steps.map((step, i) => (
                        <IndoorStepRow
                            key={i}
                            step={{ ...step, description: resolveStepDesc(step.description, roomNameMap) }}
                            isActive={i === currentStepIndex}
                            isLast={i === activeRoute.steps.length - 1}
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (routeStep === 'IDLE') return null;

    const isPickA = routeStep === 'PICK_A';
    const isError = routeStep === 'ERROR';

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

    // Show a compact pill while the route is still calculating — not the full panel.
    if (!routeStats) {
        return (
            <div style={{
                position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                zIndex: 20, background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(10px)',
                borderRadius: 99, padding: '11px 24px',
                border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)',
                fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}>
                ⏳ Calculating route…
            </div>
        );
    }

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
            <div style={{
                flexShrink: 0, padding: '14px 16px 10px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9', lineHeight: 1.1 }}>
                        {routeStats.minutes} min
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                        {fmtDist(routeStats.metres)}
                        {buildingA && buildingB && (
                            <span> · {buildingA.name} → {buildingB.name}</span>
                        )}
                    </div>
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
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
                {outdoorSteps.length === 0 ? (
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center' }}>
                        Follow the highlighted path on the map.
                    </div>
                ) : (
                    outdoorSteps.map((s, i) => (
                        <OutdoorStepRow
                            key={i}
                            metres={s.metres}
                            dir={s.dir}
                            isLast={i === outdoorSteps.length - 1}
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
