'use client';
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { locations } from '../data/locations';

function getLabel(loc) {
    const match = loc.id.match(/^([A-Z]+)-([A-Z]+)$/);
    if (match) return `${match[1]}-${match[2][0]}`;
    return loc.name.slice(0, 2).toUpperCase();
}

export function useBuildingMarkers({ map, styleLoaded, onLocationSelect }) {
    const markersRef = useRef([]);

    useEffect(() => {
        if (!map || !styleLoaded) return;

        markersRef.current.forEach(m => m.remove());
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
                    'background:#7C3AED',
                    'border:3px solid rgba(255,255,255,0.95)',
                    'display:flex', 'align-items:center', 'justify-content:center',
                    'font-size:11px', 'font-weight:800', 'color:#fff',
                    'box-shadow:0 3px 12px rgba(0,0,0,0.4)',
                    'cursor:pointer',
                    'transition:transform 0.15s ease',
                    'user-select:none',
                    'white-space:nowrap',
                ].join(';');
                chip.textContent = label;

                chip.addEventListener('mouseenter', () => { chip.style.transform = 'scale(1.15)'; });
                chip.addEventListener('mouseleave', () => { chip.style.transform = 'scale(1)'; });

                // Use a single guarded handler — `click` fires on tap on all modern
                // mobile browsers, but stopPropagation prevents the map's onClick
                // from also firing and treating it as an empty-map tap.
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
                markersRef.current.push(marker);
            });

        const onZoom = () => {
            markersRef.current.forEach(m => setVisibility(m.getElement()));
        };
        map.on('zoom', onZoom);

        return () => {
            map.off('zoom', onZoom);
            markersRef.current.forEach(m => m.remove());
            markersRef.current = [];
        };
    }, [map, styleLoaded, onLocationSelect]);
}
