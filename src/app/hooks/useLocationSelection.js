'use client';
// Tracks which building or location the user has selected and flies the map to it.
import { useState } from 'react';

export default function useLocationSelection({ mapRef, setSearchOpen, setQuery, buildings = [], buildingLookup = {} }) {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [activeBuilding,   setActiveBuilding]   = useState(null);
    const [activeFloorName,  setActiveFloorName]  = useState(null);

    const matchBuildingFromLocation = (loc) => {
        if (!loc) return null;
        if (loc.buildingId && buildingLookup[loc.buildingId]) return buildingLookup[loc.buildingId];

        const text = ((loc.name || '') + ' ' + (loc.id || '')).toLowerCase().trim();
        if (!text) return null;

        const blockMatch = text.match(/block\s+([a-z])\b/);
        if (blockMatch) {
            const letter = blockMatch[1];
            const byBlock = buildings.find(b => new RegExp(`block\\s*${letter}\\b`, 'i').test(b.name));
            if (byBlock) return byBlock;
        }

        return buildings.find(b => {
            const bname = b.name.toLowerCase();
            if (text.includes(bname) || bname.includes(text)) return true;
            const tokens = bname.split(/[\s\-()]+/).filter(t => t.length > 3);
            return tokens.some(tok => text.includes(tok));
        }) || null;
    };

    const handleSelectLocation = (loc) => {
        setSelectedLocation(loc);
        setSearchOpen(false);
        setQuery('');

        const matched = matchBuildingFromLocation(loc);
        if (matched) {
            setActiveBuilding(matched);
            const ground = matched.floors.find(f => f.z === 1) || matched.floors[0];
            setActiveFloorName(ground ? ground.name : null);
        } else {
            setActiveBuilding(null);
            setActiveFloorName(null);
        }

        const lng = loc.coordinates?.[0] ?? loc.lng;
        const lat = loc.coordinates?.[1] ?? loc.lat;
        if (lng != null && lat != null && mapRef.current) {
            try {
                mapRef.current.flyTo({ center: [lng, lat], zoom: 17.5, duration: 1200 });
            } catch (err) {
                console.warn('flyTo location suppressed:', err?.message || err);
            }
        }
    };

    return {
        selectedLocation, setSelectedLocation,
        activeBuilding,   setActiveBuilding,
        activeFloorName,  setActiveFloorName,
        handleSelectLocation,
        matchBuildingFromLocation,
    };
}
