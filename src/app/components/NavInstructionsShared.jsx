'use client';
// Shared primitives for nav instruction panels: constants, step-coordinate math, and reusable UI sub-components.
import { haversineM } from '../lib/routeUtils';
import styles from '../styles/NavInstructionsShared.module.css';

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

// Walks the route polyline to find the map coordinate at each step boundary.
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

export function PullHandle({ expanded, label }) {
    return (
        <div className={styles.pullHandle}>
            <div className={styles.pullBar} />
            <span className={styles.pullLabel}>{expanded ? 'hide steps' : label}</span>
        </div>
    );
}

export function PrevNextBar({ onPrev, onNext, isFirst, isLast }) {
    return (
        <div className={styles.prevNextBar}>
            <button
                onClick={onPrev} disabled={isFirst}
                className={styles.btnPrev}
                style={{
                    background: isFirst ? 'transparent' : 'var(--btn-ghost-bg)',
                    color: isFirst ? 'var(--text-muted)' : 'var(--text-primary)',
                    cursor: isFirst ? 'not-allowed' : 'pointer',
                }}
            >‹ Previous</button>
            <button
                onClick={onNext} disabled={isLast}
                className={styles.btnNext}
                style={{
                    background: isLast ? 'rgba(124,58,237,0.15)' : 'linear-gradient(135deg, var(--accent-purple) 0%, #5b21b6 100%)',
                    color: isLast ? 'var(--text-muted)' : '#fff',
                    cursor: isLast ? 'not-allowed' : 'pointer',
                    boxShadow: isLast ? 'none' : '0 4px 14px rgba(124,58,237,0.4)',
                }}
            >Next ›</button>
        </div>
    );
}

export function StepIconBox({ icon, accent = 'purple' }) {
    const border = accent === 'teal' ? '1.5px solid rgba(0,180,180,0.45)' : '1.5px solid rgba(124,58,237,0.45)';
    const bg     = accent === 'teal' ? 'rgba(0,180,180,0.12)' : 'rgba(124,58,237,0.14)';
    return (
        <div className={styles.stepIconBox} style={{ background: bg, border }}>
            {icon}
        </div>
    );
}
