'use client';
import { useCallback } from 'react';
import { locations } from '../data/locations';

function buildOutdoorFallback(destFeature, startFeature = null) {
    const dp = destFeature?.properties;
    if (!dp || dp.centerLng == null || dp.centerLat == null) return null;

    const navDest = {
        id:          `room-${dp.poiId}`,
        name:        dp.name || dp.roomCode || dp.buildingName || 'Destination',
        coordinates: [dp.centerLng, dp.centerLat],
    };

    let navStart = null;
    if (startFeature) {
        const sp = startFeature.properties;
        if (sp?.centerLng != null && sp?.centerLat != null) {
            navStart = {
                id:          `room-${sp.poiId}`,
                name:        sp.name || sp.roomCode || sp.buildingName || 'Start',
                coordinates: [sp.centerLng, sp.centerLat],
            };
        }
    }

    return { navDest, navStart };
}

export { buildOutdoorFallback };

export default function useNavDrawer({
    handleNavigateTo,
    handleCancelNavigation,
    setActiveNavSystem,
    setNavTarget,
    setIsNavigating,
    setNavStartOverride,
    setNavDrawerOpen,
    setNavPointA,
    setNavPointB,
}) {
    const handleNavDrawerNavigate = useCallback((pointA, pointB) => {
        const toBuildingLoc = (pt) => {
            if (!pt) return null;
            if (pt.type === 'location') return pt.loc;
            if (pt.type === 'gps' || pt.type === 'coords')
                return { id: pt.type, name: pt.label, coordinates: pt.coords };
            if (pt.type === 'room') {
                const buildingId = pt.feature?.properties?.buildingId;
                if (buildingId == null) return null;
                const loc = locations.find(l => String(l.buildingId) === String(buildingId));
                return loc ?? null;
            }
            return null;
        };

        if (pointA.type === 'room' && pointB.type === 'room') {
            setIsNavigating(false);
            setNavTarget(null);
            setNavStartOverride(null);
            setActiveNavSystem('indoor');
            handleNavigateTo(pointB.feature, pointA.feature);

        } else if (pointB.type === 'room') {
            if (pointA.type === 'gps' || pointA.type === 'room') {
                setIsNavigating(false);
                setNavTarget(null);
                setNavStartOverride(null);
                setActiveNavSystem('indoor');
                const startOverride = pointA.type === 'room' ? pointA.feature : null;
                handleNavigateTo(pointB.feature, startOverride);
            } else {
                const dp = pointB.feature?.properties;
                if (dp?.centerLng != null && dp?.centerLat != null) {
                    handleCancelNavigation();
                    setActiveNavSystem('outdoor');
                    setNavTarget({
                        id: `room-${dp.poiId}`,
                        name: dp.name || dp.roomCode || dp.buildingName || 'Destination',
                        coordinates: [dp.centerLng, dp.centerLat],
                    });
                    setIsNavigating(true);
                    const startLoc = toBuildingLoc(pointA);
                    if (startLoc) setNavStartOverride(startLoc);
                }
            }

        } else {
            const destLoc = toBuildingLoc(pointB);
            if (destLoc) {
                handleCancelNavigation();
                setActiveNavSystem('outdoor');
                setNavTarget(destLoc);
                setIsNavigating(true);
                const startLoc = toBuildingLoc(pointA);
                if (startLoc) setNavStartOverride(startLoc);
                else setNavStartOverride(null);
            }
        }

        setNavDrawerOpen(false);
        setNavPointA(null);
        setNavPointB(null);
    }, [handleNavigateTo, handleCancelNavigation, setActiveNavSystem, setNavTarget,
        setIsNavigating, setNavStartOverride, setNavDrawerOpen, setNavPointA, setNavPointB]);

    return { handleNavDrawerNavigate, buildOutdoorFallback };
}
