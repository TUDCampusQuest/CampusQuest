'use client';
import { STEP_ICON, PullHandle, PrevNextBar, StepIconBox } from './NavInstructionsShared';
import { fmtDist } from '../lib/routeUtils';
import { getRoomDisplayName } from '../lib/roomUtils';

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
                    padding: '12px 16px 4px',
                }}>
                    {steps.map((s, i) => (
                        <div
                            key={i}
                            onClick={() => { onToggleExpanded(i); flyTo(s.location, 19); }}
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

            {/* Compact strip */}
            <div style={{
                background: 'var(--bg-glass)',
                backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                borderTop: '1px solid rgba(124,58,237,0.35)',
                boxShadow: '0 -6px 32px rgba(0,0,0,0.55), 0 -1px 0 rgba(124,58,237,0.2)',
                paddingBottom: 'env(safe-area-inset-bottom)',
            }}>
                <div onClick={() => onToggleExpanded(idx)}>
                    <PullHandle expanded={expanded} label={`${idx + 1} / ${steps.length} steps`} />
                </div>

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
                    <div style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                        color: 'var(--accent-teal2)',
                        background: 'rgba(0,180,180,0.12)',
                        border: '1px solid rgba(0,180,180,0.3)',
                        borderRadius: 20, padding: '3px 9px', flexShrink: 0,
                    }}>Indoor</div>
                </div>

                <PrevNextBar
                    onPrev={onPrev} onNext={onNext}
                    isFirst={idx === 0} isLast={idx === steps.length - 1}
                />
            </div>
        </div>
    );
}
