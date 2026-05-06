'use client';
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { locations } from '../data/locations';

function getLabel(loc) {
    const match = loc.id.match(/^([A-Z]+)-([A-Z]+)$/);
    if (match) return `${match[1]}-${match[2][0]}`;
    return loc.name.slice(0, 2).toUpperCase();
}

function getChipColor(locId, buildingA, buildingB) {
    if (buildingA?.id && locId === buildingA.id) return '#22c55e'; // green = start
    if (buildingB?.id && locId === buildingB.id) return '#ef4444'; // red = destination
    return '#7C3AED';
}

export function useBuildingMarkers({ map, styleLoaded, onLocationSelect, buildingA, buildingB }) {
    const markersRef   = useRef([]); // [{ marker, chip, locId }]
    const buildingARef = useRef(buildingA);
    const buildingBRef = useRef(buildingB);
    buildingARef.current = buildingA;
    buildingBRef.current = buildingB;

    // Create markers once when map/style is ready
    useEffect(() => {
        if (!map || !styleLoaded) return;

        markersRef.current.forEach(m => m.marker.remove());
        markersRef.current = [];

        const setVisibility = (wrapper) => {
            wrapper.style.visibility = map.getZoom() >= 15 ? 'visible' : 'hidden';
        };

        locations
            .filter(loc => Array.isArray(loc.coordinates) && !/trail/i.test(loc.name))
            .forEach(loc => {
                const label = getLabel(loc);

                const wrapper = document.createElement('div');
                wrapper.style.cssText = 'width:0;height:0;position:relative;';

                const chip = document.createElement('div');
                chip.style.cssText = [
                    'position:absolute',
                    'top:-20px', 'left:-20px',
                    'width:40px', 'height:40px',
                    'border-radius:50%',
                    `background:${getChipColor(loc.id, buildingARef.current, buildingBRef.current)}`,
                    'border:3px solid rgba(255,255,255,0.95)',
                    'display:flex', 'align-items:center', 'justify-content:center',
                    'font-size:11px', 'font-weight:800', 'color:#fff',
                    'box-shadow:0 3px 12px rgba(0,0,0,0.4)',
                    'cursor:pointer',
                    'transition:background 0.25s ease,transform 0.15s ease',
                    'user-select:none',
                    'white-space:nowrap',
                ].join(';');
                chip.textContent = label;

                chip.addEventListener('mouseenter', () => { chip.style.transform = 'scale(1.15)'; });
                chip.addEventListener('mouseleave', () => { chip.style.transform = 'scale(1)'; });

                const fireSelect = (e) => {
                    try {
                        e.stopPropagation();
                        onLocationSelect?.(loc);
                    } catch (err) {
                        console.warn('building marker handler error:', err?.message || err);
                    }
                };
                chip.addEventListener('click', fireSelect);

                wrapper.appendChild(chip);

                const marker = new mapboxgl.Marker({ element: wrapper, anchor: 'center' })
                    .setLngLat(loc.coordinates)
                    .addTo(map);

                setVisibility(wrapper);
                markersRef.current.push({ marker, chip, locId: loc.id });
            });

        const onZoom = () => {
            markersRef.current.forEach(({ marker }) => setVisibility(marker.getElement()));
        };
        map.on('zoom', onZoom);

        return () => {
            map.off('zoom', onZoom);
            markersRef.current.forEach(({ marker }) => marker.remove());
            markersRef.current = [];
        };
    }, [map, styleLoaded, onLocationSelect]);

    // Recolor chips whenever buildingA / buildingB change.
    // Also runs once after mount with whatever values are current at that point.
    useEffect(() => {
        if (!markersRef.current.length) return;
        markersRef.current.forEach(({ chip, locId }) => {
            chip.style.background = getChipColor(locId, buildingA, buildingB);
        });
    }); // no dep array — runs after every render so it always stays in sync
}
