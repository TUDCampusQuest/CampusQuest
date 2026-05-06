'use client';
// Outdoor step-by-step navigation panel with route summary, avoid-stairs toggle, and direction steps.
import { useState } from 'react';
import { DIR_ARROW, PullHandle, PrevNextBar, StepIconBox } from './NavInstructionsShared';
import { fmtDist } from '../lib/routeUtils';
import styles from '../styles/OutdoorInstructions.module.css';

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
        <div className={styles.container}>

            {expanded && (
                <div className={styles.expandedList}>
                    <div className={styles.summaryRow}>
                        <div>
                            <div className={styles.summaryMinutes}>{routeStats.minutes} min</div>
                            <div className={styles.summaryDist}>
                                {fmtDist(routeStats.metres)}
                                {buildingA && buildingB && ` · ${buildingA.name} → ${buildingB.name}`}
                            </div>
                        </div>
                        <div className={styles.summaryControls}>
                            <label className={styles.toggleLabel}>
                                <div
                                    onClick={() => setAvoidStairs(v => !v)}
                                    className={styles.toggleTrack}
                                    style={{ background: avoidStairs ? 'var(--accent-purple)' : 'var(--btn-ghost-bg)' }}
                                >
                                    <div className={styles.toggleThumb} style={{ left: avoidStairs ? 15 : 2 }} />
                                </div>
                                <span className={styles.toggleText}>Avoid stairs</span>
                            </label>
                            <button onClick={onChangeStart} className={styles.changeStartBtn}>↺ Start</button>
                        </div>
                    </div>

                    {outdoorSteps.length === 0 ? (
                        <div className={styles.emptySteps}>Follow the highlighted path on the map.</div>
                    ) : outdoorSteps.map((s, i) => (
                        <div
                            key={i}
                            onClick={() => { onToggleExpanded(i); flyTo(outdoorBendCoords[i]); }}
                            className={styles.stepRow}
                            style={{
                                borderBottom: i < outdoorSteps.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                                opacity: i === outdoorStepIndex ? 1 : 0.5,
                            }}
                        >
                            <span className={styles.stepArrow} style={{ color: i === outdoorStepIndex ? 'var(--accent-purple)' : 'var(--text-secondary)' }}>
                                {DIR_ARROW[s.dir] ?? '→'}
                            </span>
                            <div className={styles.stepContent}>
                                <div style={{
                                    fontSize: 13,
                                    fontWeight: i === outdoorStepIndex ? 800 : 500,
                                    color: i === outdoorStepIndex ? 'var(--text-primary)' : 'var(--text-secondary)',
                                }}>
                                    Walk {fmtDist(s.metres)} · {s.dir}
                                </div>
                                <div className={styles.stepDist}>~{Math.max(1, Math.ceil(s.metres / 80))} min</div>
                            </div>
                            {i === outdoorStepIndex && <div className={styles.stepDot} />}
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.strip}>
                <div onClick={() => onToggleExpanded(outdoorStepIndex)}>
                    <PullHandle
                        expanded={expanded}
                        label={`${outdoorStepIndex + 1} / ${outdoorSteps.length || 1} steps · ${routeStats.minutes} min`}
                    />
                </div>

                <div className={styles.currentStepRow}>
                    <StepIconBox icon={arrow} accent="purple" />
                    <div className={styles.stepMain}>
                        {currentStep ? (
                            <>
                                <div className={styles.stepWalkDist}>Walk {fmtDist(currentStep.metres)}</div>
                                <div className={styles.stepDir}>heading {currentStep.dir}</div>
                            </>
                        ) : (
                            <div className={styles.stepFollowPath}>Follow the highlighted path</div>
                        )}
                    </div>
                    <div className={styles.stepTotals}>
                        <div className={styles.stepTotalDist}>{fmtDist(routeStats.metres)}</div>
                        <div className={styles.stepTotalMin}>{routeStats.minutes} min</div>
                    </div>
                </div>

                {outdoorSteps.length > 1 && (
                    <PrevNextBar onPrev={onPrev} onNext={onNext} isFirst={isFirst} isLast={isLast} />
                )}
            </div>
        </div>
    );
}
