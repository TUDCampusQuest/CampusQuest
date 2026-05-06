'use client';
// Turn-by-turn nav bar — coordinates indoor/outdoor step panels and camera controls.
import { useState, useMemo, useEffect, useCallback } from 'react';
import { deriveSteps } from '../lib/routeUtils';
import { buildStepBendCoords } from './NavInstructionsShared';
import IndoorInstructions from './IndoorInstructions';
import OutdoorInstructions from './OutdoorInstructions';
import styles from '../styles/NavInstructions.module.css';

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
            <div className={`${styles.pill} ${styles.pillPickA}`}>
                📍 Tap your start building on the map
            </div>
        );
    }

    if (routeStep === 'ERROR') {
        return (
            <div className={styles.errorWrapper}>
                <div className={styles.errorPill}>{routeError ?? 'No route available'}</div>
                <button onClick={onChangeStart} className={styles.changeStartBtn}>↺ Change Start</button>
            </div>
        );
    }

    if (!routeStats) {
        return (
            <div className={`${styles.pill} ${styles.pillCalculating}`}>
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
