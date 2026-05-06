'use client';
import { haversineM } from '../lib/routeUtils';

// ── Utility ───────────────────────────────────────────────────────────────────

export const STEP_ICON = {
    walk:           '🚶',
    stairs_up:      '⬆️',
    stairs_down:    '⬇️',
    enter_building: '🚪',
    exit_building:  '🏃',
    arrived:        '✅',
};

export const DIR_ARROW = {
    north: '↑', northeast: '↗', east: '→', southeast: '↘',
    south: '↓', southwest: '↙', west: '←', northwest: '↖',
};

// Walk the actual route polyline to find the coordinate at each step boundary.
export function buildStepBendCoords(steps, routeCoords) {
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

export function PullHandle({ expanded, label }) {
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

export function PrevNextBar({ onPrev, onNext, isFirst, isLast }) {
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

export function StepIconBox({ icon, accent = 'purple' }) {
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
