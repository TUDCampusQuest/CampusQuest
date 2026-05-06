'use client';
import { useState } from 'react';
import { DIR_ARROW, PullHandle, PrevNextBar, StepIconBox } from './NavInstructionsShared';
import { fmtDist } from '../lib/routeUtils';

export default function OutdoorInstructions({
    outdoorSteps, outdoorStepIndex, routeStats,
    buildingA, buildingB,
    expanded, onToggleExpanded,
    onPrev, onNext,
    onChangeStart, flyTo, outdoorBendCoords,
}) {
    const [avoidStairs, setAvoidStairs] = useState(false);

    const currentStep = outdoorSteps[outdoorStepIndex];
    const isFirst     = outdoorStepIndex === 0;
    const isLast      = outdoorStepIndex >= outdoorSteps.length - 1;
    const arrow       = DIR_ARROW[currentStep?.dir] ?? '🚶';

    return (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20 }}>

            {/* Expanded step list */}
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
                            onClick={() => { onToggleExpanded(i); flyTo(outdoorBendCoords[i]); }}
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

            {/* Compact strip */}
            <div style={{
                background: 'var(--bg-glass)',
                backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                borderTop: '1px solid rgba(124,58,237,0.35)',
                boxShadow: '0 -6px 32px rgba(0,0,0,0.55), 0 -1px 0 rgba(124,58,237,0.2)',
                paddingBottom: 'env(safe-area-inset-bottom)',
            }}>
                <div onClick={() => onToggleExpanded(outdoorStepIndex)}>
                    <PullHandle
                        expanded={expanded}
                        label={`${outdoorStepIndex + 1} / ${outdoorSteps.length || 1} steps · ${routeStats.minutes} min`}
                    />
                </div>

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
                        onPrev={onPrev} onNext={onNext}
                        isFirst={isFirst} isLast={isLast}
                    />
                )}
            </div>
        </div>
    );
}
