'use client';
// Turn-by-turn nav bar — compact bottom strip with current step + Prev/Next camera controls.
// Full step list slides up from a pull handle so the map stays visible.
import { useState, useMemo, useEffect, useCallback } from 'react';
import { getRoomDisplayName } from '../lib/roomUtils';
import { deriveSteps, fmtDist, haversineM } from '../lib/routeUtils';

const ROOM_CODE_RE = /[A-Z]{2}-\d{3}[A-Z]?$/;

const STEP_ICON = {
    walk:           '🚶',
    stairs_up:      '⬆️',
    stairs_down:    '⬇️',
    enter_building: '🚪',
    exit_building:  '🏃',
    arrived:        '✅',
};

const DIR_ARROW = {
    north: '↑', northeast: '↗', east: '→', southeast: '↘',
    south: '↓', southwest: '↙', west: '←', northwest: '↖',
};

function resolveStepDesc(description, roomNameMap) {
    if (!roomNameMap || !description) return description;
    const match = description.match(ROOM_CODE_RE);
    if (!match) return description;
    const code = match[0];
    const name = getRoomDisplayName(code, roomNameMap);
    if (name === code) return description;
    return description.slice(0, description.length - code.length) + name;
}

// Walk the actual route polyline to find the coordinate at each step boundary.
function buildStepBendCoords(steps, routeCoords) {
    if (!steps?.length || !routeCoords?.length) return [];
    if (routeCoords.length === 1) return steps.map(() => routeCoords[0]);
    const cumDist = [0];
    for (let i = 1; i < routeCoords.length; i++)
        cumDist.push(cumDist[i - 1] + haversineM(routeCoords[i - 1], routeCoords[i]));
    const totalRouteLen   = cumDist[cumDist.length - 1];
    const totalStepMetres = steps.reduce((s, x) => s + (x.metres ?? 0), 0);
    if (totalRouteLen === 0 || totalStepMetres === 0) return steps.map(() => routeCoords[0]);
    let accumulated = 0;
    return steps.map(step => {
        accumulated += (step.metres ?? 0);
        const targetDist = (accumulated / totalStepMetres) * totalRouteLen;
        for (let i = 1; i < routeCoords.length; i++) {
            if (cumDist[i] >= targetDist) {
                const segLen = cumDist[i] - cumDist[i - 1];
                const frac   = segLen > 0 ? (targetDist - cumDist[i - 1]) / segLen : 0;
                const a = routeCoords[i - 1], b = routeCoords[i];
                return [a[0] + frac * (b[0] - a[0]), a[1] + frac * (b[1] - a[1])];
            }
        }
        return routeCoords[routeCoords.length - 1];
    });
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function PullHandle({ expanded, label }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            paddingTop: 10, paddingBottom: 4, cursor: 'pointer', gap: 3, userSelect: 'none',
        }}>
            <div style={{
                width: 36, height: 4, borderRadius: 99,
                background: 'rgba(124,58,237,0.5)',
            }} />
            <span style={{
                fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: 'var(--text-muted)', fontWeight: 600,
            }}>
                {expanded ? 'hide steps' : label}
            </span>
        </div>
    );
}

function PrevNextBar({ onPrev, onNext, isFirst, isLast }) {
    return (
        <div style={{ display: 'flex', gap: 10, padding: '0 16px 16px' }}>
            <button
                onClick={onPrev} disabled={isFirst}
                style={{
                    flex: 1, height: 44, borderRadius: 12,
                    border: '1px solid var(--border-card)',
                    background: isFirst ? 'transparent' : 'var(--btn-ghost-bg)',
                    color: isFirst ? 'var(--text-muted)' : 'var(--text-primary)',
                    fontWeight: 700, fontSize: 14,
                    cursor: isFirst ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                }}
            >‹ Previous</button>
            <button
                onClick={onNext} disabled={isLast}
                style={{
                    flex: 1, height: 44, borderRadius: 12, border: 'none',
                    background: isLast
                        ? 'rgba(124,58,237,0.15)'
                        : 'linear-gradient(135deg, var(--accent-purple) 0%, #5b21b6 100%)',
                    color: isLast ? 'var(--text-muted)' : '#fff',
                    fontWeight: 700, fontSize: 14,
                    cursor: isLast ? 'not-allowed' : 'pointer',
                    boxShadow: isLast ? 'none' : '0 4px 14px rgba(124,58,237,0.4)',
                    transition: 'all 0.15s',
                }}
            >Next ›</button>
        </div>
    );
}

function StepIconBox({ icon, accent = 'purple' }) {
    const border = accent === 'teal'
        ? '1.5px solid rgba(0,180,180,0.45)'
        : '1.5px solid rgba(124,58,237,0.45)';
    const bg = accent === 'teal'
        ? 'rgba(0,180,180,0.12)'
        : 'rgba(124,58,237,0.14)';
    return (
        <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: bg, border,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
        }}>
            {icon}
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function NavInstructions({
    routeStep, routeStats, routeCoords,
    buildingA, buildingB, routeError,
    onChangeStart, activeRoute,
    roomNameMap, mapRef,
}) {
    const [expanded,         setExpanded]        = useState(false);
    const [avoidStairs,      setAvoidStairs]      = useState(false);
    const [outdoorStepIndex, setOutdoorStepIndex] = useState(0);
    const [indoorStepIndex,  setIndoorStepIndex]  = useState(0);

    const outdoorSteps      = useMemo(() => deriveSteps(routeCoords), [routeCoords]);
    const outdoorBendCoords = useMemo(() => buildStepBendCoords(outdoorSteps, routeCoords), [outdoorSteps, routeCoords]);

    useEffect(() => { setOutdoorStepIndex(0); setExpanded(false); }, [routeCoords]);
    useEffect(() => { setIndoorStepIndex(0);  setExpanded(false); }, [activeRoute]);

    const flyTo = useCallback((coord, zoom = 18) => {
        if (!coord || !mapRef?.current) return;
        try { mapRef.current.flyTo({ center: coord, zoom, duration: 900, pitch: 45 }); }
        catch (_) {}
    }, [mapRef]);

    const handleOutdoorPrev = () => {
        const n = Math.max(0, outdoorStepIndex - 1);
        setOutdoorStepIndex(n); flyTo(outdoorBendCoords[n]);
    };
    const handleOutdoorNext = () => {
        const n = Math.min(outdoorSteps.length - 1, outdoorStepIndex + 1);
        setOutdoorStepIndex(n); flyTo(outdoorBendCoords[n]);
    };
    const handleIndoorPrev = () => {
        const n = Math.max(0, indoorStepIndex - 1);
        setIndoorStepIndex(n); flyTo(activeRoute?.steps?.[n]?.location, 19);
    };
    const handleIndoorNext = () => {
        const n = Math.min((activeRoute?.steps?.length ?? 1) - 1, indoorStepIndex + 1);
        setIndoorStepIndex(n); flyTo(activeRoute?.steps?.[n]?.location, 19);
    };

    // ── INDOOR ────────────────────────────────────────────────────────────────
    if (activeRoute?.steps?.length > 0) {
        const steps   = activeRoute.steps;
        const idx     = indoorStepIndex;
        const step    = steps[idx];
        const desc    = resolveStepDesc(step?.description ?? '', roomNameMap);
        const icon    = STEP_ICON[step?.type] ?? '•';
        const dist    = fmtDist(step?.metres);

        return (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20 }}>

                {/* ── Expanded step list ── */}
                {expanded && (
                    <div style={{
                        background: 'var(--bg-glass)',
                        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                        borderTop: '1px solid rgba(124,58,237,0.25)',
                        borderLeft: '1px solid var(--border-subtle)',
                        borderRight: '1px solid var(--border-subtle)',
                        borderRadius: '20px 20px 0 0',
                        maxHeight: '38dvh', overflowY: 'auto',
                        padding: '12px 16px 4px',
                    }}>
                        {steps.map((s, i) => (
                            <div
                                key={i}
                                onClick={() => { setIndoorStepIndex(i); flyTo(s.location, 19); }}
                                style={{
                                    display: 'flex', gap: 10, alignItems: 'flex-start',
                                    padding: '9px 0',
                                    borderBottom: i < steps.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                                    cursor: 'pointer',
                                    opacity: i === idx ? 1 : 0.5,
                                    transition: 'opacity 0.15s',
                                }}
                            >
                                <span style={{ fontSize: 14, marginTop: 2, flexShrink: 0 }}>{STEP_ICON[s.type] ?? '•'}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: 13,
                                        fontWeight: i === idx ? 800 : 500,
                                        color: i === idx ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    }}>
                                        {resolveStepDesc(s.description, roomNameMap)}
                                    </div>
                                    {s.metres > 0 && (
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{fmtDist(s.metres)}</div>
                                    )}
                                </div>
                                {i === idx && (
                                    <div style={{
                                        width: 7, height: 7, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                                        background: 'var(--accent-purple)',
                                        boxShadow: '0 0 0 3px rgba(124,58,237,0.25)',
                                    }} />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Compact strip ── */}
                <div style={{
                    background: 'var(--bg-glass)',
                    backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                    borderTop: '1px solid rgba(124,58,237,0.35)',
                    boxShadow: '0 -6px 32px rgba(0,0,0,0.55), 0 -1px 0 rgba(124,58,237,0.2)',
                    paddingBottom: 'env(safe-area-inset-bottom)',
                }}>
                    <div onClick={() => setExpanded(e => !e)}>
                        <PullHandle expanded={expanded} label={`${idx + 1} / ${steps.length} steps`} />
                    </div>

                    {/* Current step row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 16px 10px' }}>
                        <StepIconBox icon={icon} accent="teal" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontSize: 14, fontWeight: 800,
                                color: 'var(--text-primary)', lineHeight: 1.3, wordBreak: 'break-word',
                            }}>{desc}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                {[dist, `${activeRoute.totalMinutes} min total`].filter(Boolean).join(' · ')}
                            </div>
                        </div>
                        {/* Indoor badge */}
                        <div style={{
                            fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                            color: 'var(--accent-teal2)',
                            background: 'rgba(0,180,180,0.12)',
                            border: '1px solid rgba(0,180,180,0.3)',
                            borderRadius: 20, padding: '3px 9px', flexShrink: 0,
                        }}>Indoor</div>
                    </div>

                    <PrevNextBar
                        onPrev={handleIndoorPrev} onNext={handleIndoorNext}
                        isFirst={idx === 0} isLast={idx === steps.length - 1}
                        />
                </div>
            </div>
        );
    }

    // ── IDLE / PICK_A / ERROR / CALCULATING ───────────────────────────────────
    if (routeStep === 'IDLE') return null;

    if (routeStep === 'PICK_A') {
        return (
            <div style={{
                position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                zIndex: 20,
                background: 'rgba(124,58,237,0.18)',
                backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                borderRadius: 99, padding: '11px 24px',
                border: '1px solid rgba(124,58,237,0.4)',
                color: 'var(--text-primary)',
                fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap',
                boxShadow: '0 4px 20px rgba(124,58,237,0.25)',
            }}>
                📍 Tap your start building on the map
            </div>
        );
    }

    if (routeStep === 'ERROR') {
        return (
            <div style={{
                position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                width: '90%', maxWidth: 400,
            }}>
                <div style={{
                    padding: '11px 24px', borderRadius: 99, fontWeight: 700, fontSize: 13,
                    background: 'rgba(239,68,68,0.15)',
                    color: '#fca5a5',
                    border: '1px solid rgba(239,68,68,0.35)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}>{routeError ?? 'No route available'}</div>
                <button onClick={onChangeStart} style={{
                    padding: '8px 20px', borderRadius: 99,
                    border: '1px solid var(--border-card)',
                    background: 'var(--btn-ghost-bg)',
                    backdropFilter: 'blur(12px)',
                    color: 'var(--text-primary)', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}>↺ Change Start</button>
            </div>
        );
    }

    if (!routeStats) {
        return (
            <div style={{
                position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                zIndex: 20,
                background: 'rgba(124,58,237,0.14)',
                backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                borderRadius: 99, padding: '11px 24px',
                border: '1px solid rgba(124,58,237,0.3)',
                color: 'var(--text-secondary)',
                fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}>
                ⏳ Calculating route…
            </div>
        );
    }

    // ── OUTDOOR ───────────────────────────────────────────────────────────────
    const currentStep = outdoorSteps[outdoorStepIndex];
    const isFirst     = outdoorStepIndex === 0;
    const isLast      = outdoorStepIndex >= outdoorSteps.length - 1;
    const arrow       = DIR_ARROW[currentStep?.dir] ?? '🚶';

    return (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20 }}>

            {/* ── Expanded step list ── */}
            {expanded && (
                <div style={{
                    background: 'var(--bg-glass)',
                    backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                    borderTop: '1px solid rgba(124,58,237,0.25)',
                    borderLeft: '1px solid var(--border-subtle)',
                    borderRight: '1px solid var(--border-subtle)',
                    borderRadius: '20px 20px 0 0',
                    maxHeight: '38dvh', overflowY: 'auto',
                    padding: '14px 16px 4px',
                }}>
                    {/* Route summary */}
                    <div style={{
                        marginBottom: 10, paddingBottom: 10,
                        borderBottom: '1px solid var(--border-subtle)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)' }}>
                                {routeStats.minutes} min
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                {fmtDist(routeStats.metres)}
                                {buildingA && buildingB && ` · ${buildingA.name} → ${buildingB.name}`}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {/* Avoid stairs toggle */}
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', userSelect: 'none' }}>
                                <div
                                    onClick={() => setAvoidStairs(v => !v)}
                                    style={{
                                        width: 32, height: 18, borderRadius: 99,
                                        background: avoidStairs ? 'var(--accent-purple)' : 'var(--btn-ghost-bg)',
                                        border: '1px solid var(--border-card)',
                                        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute', top: 2, left: avoidStairs ? 15 : 2,
                                        width: 14, height: 14, borderRadius: '50%',
                                        background: '#fff', transition: 'left 0.2s',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                                    }} />
                                </div>
                                <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>Avoid stairs</span>
                            </label>
                            <button onClick={onChangeStart} style={{
                                padding: '4px 12px', borderRadius: 99,
                                border: '1px solid var(--border-card)',
                                background: 'var(--btn-ghost-bg)',
                                color: 'var(--text-primary)', fontWeight: 700, fontSize: 11, cursor: 'pointer',
                            }}>↺ Start</button>
                        </div>
                    </div>

                    {/* Step rows */}
                    {outdoorSteps.length === 0 ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '10px 0' }}>
                            Follow the highlighted path on the map.
                        </div>
                    ) : outdoorSteps.map((s, i) => (
                        <div
                            key={i}
                            onClick={() => { setOutdoorStepIndex(i); flyTo(outdoorBendCoords[i]); }}
                            style={{
                                display: 'flex', gap: 10, alignItems: 'flex-start',
                                padding: '9px 0',
                                borderBottom: i < outdoorSteps.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                                cursor: 'pointer',
                                opacity: i === outdoorStepIndex ? 1 : 0.5,
                                transition: 'opacity 0.15s',
                            }}
                        >
                            <span style={{
                                fontSize: 16, flexShrink: 0, marginTop: 1,
                                color: i === outdoorStepIndex ? 'var(--accent-purple)' : 'var(--text-secondary)',
                            }}>{DIR_ARROW[s.dir] ?? '→'}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: 13,
                                    fontWeight: i === outdoorStepIndex ? 800 : 500,
                                    color: i === outdoorStepIndex ? 'var(--text-primary)' : 'var(--text-secondary)',
                                }}>
                                    Walk {fmtDist(s.metres)} · {s.dir}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                                    ~{Math.max(1, Math.ceil(s.metres / 80))} min
                                </div>
                            </div>
                            {i === outdoorStepIndex && (
                                <div style={{
                                    width: 7, height: 7, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                                    background: 'var(--accent-purple)',
                                    boxShadow: '0 0 0 3px rgba(124,58,237,0.25)',
                                }} />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ── Compact strip ── */}
            <div style={{
                background: 'var(--bg-glass)',
                backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                borderTop: '1px solid rgba(124,58,237,0.35)',
                boxShadow: '0 -6px 32px rgba(0,0,0,0.55), 0 -1px 0 rgba(124,58,237,0.2)',
                paddingBottom: 'env(safe-area-inset-bottom)',
            }}>
                <div onClick={() => setExpanded(e => !e)}>
                    <PullHandle
                        expanded={expanded}
                        label={`${outdoorStepIndex + 1} / ${outdoorSteps.length || 1} steps · ${routeStats.minutes} min`}
                    />
                </div>

                {/* Current step row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 16px 10px' }}>
                    <StepIconBox icon={arrow} accent="purple" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {currentStep ? (
                            <>
                                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                                    Walk {fmtDist(currentStep.metres)}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>
                                    heading {currentStep.dir}
                                </div>
                            </>
                        ) : (
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Follow the highlighted path</div>
                        )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{fmtDist(routeStats.metres)}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{routeStats.minutes} min</div>
                    </div>
                </div>

                {outdoorSteps.length > 1 && (
                    <PrevNextBar
                        onPrev={handleOutdoorPrev} onNext={handleOutdoorNext}
                        isFirst={isFirst} isLast={isLast}
                    />
                )}
            </div>
        </div>
    );
}
