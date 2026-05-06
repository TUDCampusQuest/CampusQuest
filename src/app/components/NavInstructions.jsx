'use client';
// Turn-by-turn nav bar — coordinates indoor/outdoor step panels and camera controls.
import { useState, useMemo, useEffect, useCallback } from 'react';
import { deriveSteps } from '../lib/routeUtils';
import { buildStepBendCoords } from './NavInstructionsShared';
import IndoorInstructions from './IndoorInstructions';
import OutdoorInstructions from './OutdoorInstructions';

export default function NavInstructions({
    routeStep, routeStats, routeCoords,
    buildingA, buildingB, routeError,
    onChangeStart, activeRoute,
    roomNameMap, mapRef,
}) {
    const [expanded,         setExpanded]        = useState(false);
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

    if (activeRoute?.steps?.length > 0) {
        return (
            <IndoorInstructions
                activeRoute={activeRoute}
                indoorStepIndex={indoorStepIndex}
                expanded={expanded}
                onToggleExpanded={(i) => {
                    if (typeof i === 'number') setIndoorStepIndex(i);
                    setExpanded(e => !e);
                }}
                onPrev={handleIndoorPrev}
                onNext={handleIndoorNext}
                roomNameMap={roomNameMap}
                flyTo={flyTo}
            />
        );
    }

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

    return (
        <OutdoorInstructions
            outdoorSteps={outdoorSteps}
            outdoorStepIndex={outdoorStepIndex}
            routeStats={routeStats}
            buildingA={buildingA}
            buildingB={buildingB}
            expanded={expanded}
            onToggleExpanded={(i) => {
                if (typeof i === 'number') setOutdoorStepIndex(i);
                setExpanded(e => !e);
            }}
            onPrev={handleOutdoorPrev}
            onNext={handleOutdoorNext}
            onChangeStart={onChangeStart}
            flyTo={flyTo}
            outdoorBendCoords={outdoorBendCoords}
        />
    );
}
