// Renders Mapbox GL layers for indoor room fills, outlines, labels, highlighted room, floor outline, and active route path.
'use client';

import { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl';

const EMPTY_GEOJSON = { type: 'FeatureCollection', features: [] };

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

    const routeGeoJSON = useMemo(() => {
        if (!routePath || routePath.length < 2) return null;
        return { type: 'Feature', geometry: { type: 'LineString', coordinates: routePath }, properties: {} };
    }, [routePath]);

    const floorFilter    = activeFloorName ? ['==', ['get', 'floorName'], activeFloorName] : ['literal', true];
    const highlightFilter = ['==', ['get', 'poiId'], highlightedRoomId ?? -1];

    return (
        <>
            <Source id="indoor-rooms" type="geojson" data={rooms ?? EMPTY_GEOJSON}>
                <Layer
                    id="indoor-rooms-fill"
                    type="fill"
                    minzoom={16}
                    maxzoom={22}
                    filter={floorFilter}
                    paint={{ 'fill-color': FILL_COLOR, 'fill-opacity': 0.92 }}
                />
                <Layer
                    id="indoor-rooms-outline"
                    type="line"
                    minzoom={16}
                    maxzoom={22}
                    filter={floorFilter}
                    paint={{ 'line-color': '#aaaaaa', 'line-width': 1.0 }}
                />
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
                <Layer
                    id="indoor-rooms-highlighted-outline"
                    type="line"
                    filter={highlightFilter}
                    paint={{ 'line-color': '#FF6600', 'line-width': 4, 'line-opacity': 1 }}
                />
            </Source>

            {floorOutlineGeoJSON && (
                <Source id="indoor-floor-outline" type="geojson" data={floorOutlineGeoJSON}>
                    <Layer
                        id="indoor-floor-outline-fill"
                        type="fill"
                        paint={{ 'fill-opacity': 0, 'fill-outline-color': '#555555' }}
                    />
                </Source>
            )}

            {routeGeoJSON && (
                <Source id="indoor-route" type="geojson" data={routeGeoJSON}>
                    <Layer
                        id="indoor-route-casing"
                        type="line"
                        paint={{ 'line-color': 'rgba(0,0,0,0.15)', 'line-width': 6, 'line-opacity': 0.6 }}
                        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                    />
                    <Layer
                        id="indoor-route-line"
                        type="line"
                        paint={{ 'line-color': '#00B4B4', 'line-width': 4, 'line-opacity': 0.9 }}
                        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                    />
                </Source>
            )}
        </>
    );
}
