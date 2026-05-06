'use client';
// Indoor step-by-step navigation panel with expandable step list and current-step strip.
import { STEP_ICON, PullHandle, PrevNextBar, StepIconBox } from './NavInstructionsShared';
import { fmtDist } from '../lib/routeUtils';
import { getRoomDisplayName } from '../lib/roomUtils';
import styles from './IndoorInstructions.module.css';

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

export default function IndoorInstructions({
    activeRoute, indoorStepIndex, expanded,
    onToggleExpanded, onPrev, onNext,
    roomNameMap, flyTo,
}) {
    const steps = activeRoute.steps;
    const idx   = indoorStepIndex;
    const step  = steps[idx];
    const desc  = resolveStepDesc(step?.description ?? '', roomNameMap);
    const icon  = STEP_ICON[step?.type] ?? '•';
    const dist  = fmtDist(step?.metres);

    return (
        <div className={styles.container}>

            {expanded && (
                <div className={styles.expandedList}>
                    {steps.map((s, i) => (
                        <div
                            key={i}
                            onClick={() => { onToggleExpanded(i); flyTo(s.location, 19); }}
                            className={styles.stepRow}
                            style={{
                                borderBottom: i < steps.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                                opacity: i === idx ? 1 : 0.5,
                            }}
                        >
                            <span className={styles.stepIcon}>{STEP_ICON[s.type] ?? '•'}</span>
                            <div className={styles.stepContent}>
                                <div style={{
                                    fontSize: 13,
                                    fontWeight: i === idx ? 800 : 500,
                                    color: i === idx ? 'var(--text-primary)' : 'var(--text-secondary)',
                                }}>
                                    {resolveStepDesc(s.description, roomNameMap)}
                                </div>
                                {s.metres > 0 && <div className={styles.stepDist}>{fmtDist(s.metres)}</div>}
                            </div>
                            {i === idx && <div className={styles.stepDot} />}
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.strip}>
                <div onClick={() => onToggleExpanded(idx)}>
                    <PullHandle expanded={expanded} label={`${idx + 1} / ${steps.length} steps`} />
                </div>

                <div className={styles.currentStepRow}>
                    <StepIconBox icon={icon} accent="teal" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div className={styles.stepDesc}>{desc}</div>
                        <div className={styles.stepMeta}>
                            {[dist, `${activeRoute.totalMinutes} min total`].filter(Boolean).join(' · ')}
                        </div>
                    </div>
                    <div className={styles.indoorBadge}>Indoor</div>
                </div>

                <PrevNextBar
                    onPrev={onPrev} onNext={onNext}
                    isFirst={idx === 0} isLast={idx === steps.length - 1}
                />
            </div>
        </div>
    );
}
