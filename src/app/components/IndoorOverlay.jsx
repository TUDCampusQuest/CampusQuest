'use client';

import { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl';

const EMPTY_GEOJSON = { type: 'FeatureCollection', features: [] };

// Color rooms by kind first, then by typeName for semantic differentiation
const FILL_COLOR = [
    'case',
    ['==', ['get', 'kind'], 'stairs'],           '#FFE0A0',
    ['==', ['get', 'kind'], 'elevator'],          '#D4EED4',
    ['==', ['get', 'kind'], 'circulation_room'],  '#EBEBEB',
    ['match',
        ['downcase', ['coalesce', ['get', 'typeName'], '']],
        ['lecture', 'lecture theatre', 'lecture hall', 'auditorium', 'theatre'], '#DCF0FF',
        ['computer lab', 'computer room', 'laboratory', 'lab'], '#E8F8F0',
        ['wc', 'toilet', 'bathroom', 'washroom'], '#FFF3E0',
        ['office', 'staff office', 'staff room'], '#F5F0FF',
        '#FFFFFF',
    ],
];

export default function IndoorOverlay({
    activeFloorName,
    activeBuilding,
    rooms,
    highlightedRoomId,
    routePath,
    isCrossBuilding,
    outdoorPathLength,
    pickingIndoorStart,
}) {
    const floorOutlineGeoJSON = useMemo(() => {
        if (!activeBuilding || !activeFloorName) return null;
        const floor = activeBuilding.floors.find(f => f.name === activeFloorName);
        if (!floor?.outline) return null;
        return {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                properties: { floorName: activeFloorName },
                geometry: floor.outline,
            }],
        };
    }, [activeBuilding, activeFloorName]);

    // For cross-building routes split into outdoor (blue dashed) and indoor (teal solid) segments.
    // For same-building routes use a single teal line.
    const outdoorRouteGeoJSON = useMemo(() => {
        if (!isCrossBuilding || !routePath || outdoorPathLength < 2) return null;
        const coords = routePath.slice(0, outdoorPathLength);
        if (coords.length < 2) return null;
        return { type: 'Feature', geometry: { type: 'LineString', coordinates: coords }, properties: {} };
    }, [routePath, isCrossBuilding, outdoorPathLength]);

    const indoorRouteGeoJSON = useMemo(() => {
        if (!routePath || routePath.length < 2) return null;
        if (isCrossBuilding) {
            // Overlap by one point so the two lines meet without a gap
            const coords = routePath.slice(Math.max(0, outdoorPathLength - 1));
            if (coords.length < 2) return null;
            return { type: 'Feature', geometry: { type: 'LineString', coordinates: coords }, properties: {} };
        }
        return { type: 'Feature', geometry: { type: 'LineString', coordinates: routePath }, properties: {} };
    }, [routePath, isCrossBuilding, outdoorPathLength]);

    const floorFilter = activeFloorName
        ? ['==', ['get', 'floorName'], activeFloorName]
        : ['literal', true];

    // -1 sentinel → matches nothing when no room is selected
    const highlightFilter = ['==', ['get', 'poiId'], highlightedRoomId ?? -1];

    return (
        <>
            <Source id="indoor-rooms" type="geojson" data={rooms ?? EMPTY_GEOJSON}>
                {/* Room fills */}
                <Layer
                    id="indoor-rooms-fill"
                    type="fill"
                    minzoom={17}
                    maxzoom={22}
                    filter={floorFilter}
                    paint={{
                        'fill-color': FILL_COLOR,
                        'fill-opacity': 0.92,
                    }}
                />

                {/* Room outlines */}
                <Layer
                    id="indoor-rooms-outline"
                    type="line"
                    minzoom={17}
                    maxzoom={22}
                    filter={floorFilter}
                    paint={{
                        'line-color': '#aaaaaa',
                        'line-width': 1.0,
                    }}
                />

                {/* Room labels */}
                <Layer
                    id="indoor-room-labels"
                    type="symbol"
                    minzoom={18}
                    maxzoom={22}
                    filter={floorFilter}
                    layout={{
                        'text-field': ['coalesce', ['get', 'name'], ['get', 'roomCode']],
                        'text-size': 13,
                        'text-allow-overlap': false,
                        'text-ignore-placement': false,
                        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                    }}
                    paint={{
                        'text-color': '#111111',
                        'text-halo-color': '#ffffff',
                        'text-halo-width': 2,
                    }}
                />

                {/* Highlighted room — outline only so label stays readable */}
                <Layer
                    id="indoor-rooms-highlighted-outline"
                    type="line"
                    filter={highlightFilter}
                    paint={{
                        'line-color': '#FF6600',
                        'line-width': 4,
                        'line-opacity': 1,
                    }}
                />

                {/* Pick-start mode — teal tint on all rooms so user knows they're tappable */}
                {pickingIndoorStart && (
                    <Layer
                        id="indoor-rooms-pick-overlay"
                        type="fill"
                        minzoom={17}
                        maxzoom={22}
                        filter={floorFilter}
                        paint={{
                            'fill-color': '#00B4B4',
                            'fill-opacity': 0.22,
                        }}
                    />
                )}
            </Source>

            {floorOutlineGeoJSON && (
                <Source id="indoor-floor-outline" type="geojson" data={floorOutlineGeoJSON}>
                    <Layer
                        id="indoor-floor-outline-fill"
                        type="fill"
                        paint={{
                            'fill-opacity': 0,
                            'fill-outline-color': '#555555',
                        }}
                    />
                </Source>
            )}

            {/* Outdoor leg of cross-building route — blue dashed */}
            {outdoorRouteGeoJSON && (
                <Source id="indoor-route-outdoor" type="geojson" data={outdoorRouteGeoJSON}>
                    <Layer
                        id="indoor-route-outdoor-casing"
                        type="line"
                        paint={{ 'line-color': 'rgba(0,0,0,0.15)', 'line-width': 6, 'line-opacity': 0.6 }}
                        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                    />
                    <Layer
                        id="indoor-route-outdoor-line"
                        type="line"
                        paint={{
                            'line-color': '#1E90FF',
                            'line-width': 4,
                            'line-opacity': 0.9,
                            'line-dasharray': [4, 3],
                        }}
                        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                        beforeId="indoor-route-outdoor-casing"
                    />
                </Source>
            )}

            {/* Indoor leg (same-building route, or indoor portion of cross-building) — teal solid */}
            {indoorRouteGeoJSON && (
                <Source id="indoor-route-indoor" type="geojson" data={indoorRouteGeoJSON}>
                    <Layer
                        id="indoor-route-indoor-casing"
                        type="line"
                        paint={{ 'line-color': 'rgba(0,0,0,0.15)', 'line-width': 6, 'line-opacity': 0.6 }}
                        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                    />
                    <Layer
                        id="indoor-route-indoor-line"
                        type="line"
                        paint={{ 'line-color': '#00B4B4', 'line-width': 4, 'line-opacity': 0.9 }}
                        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                        beforeId="indoor-route-indoor-casing"
                    />
                </Source>
            )}
        </>
    );
}
