'use client';

import { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl';

const EMPTY_GEOJSON = { type: 'FeatureCollection', features: [] };

const FILL_COLOR = [
    'case',
    ['==', ['get', 'kind'], 'stairs'],           '#FFE0A0',
    ['==', ['get', 'kind'], 'elevator'],          '#D4EED4',
    ['==', ['get', 'kind'], 'circulation_room'],  '#EBEBEB',
    '#FFFFFF',
];

export default function IndoorOverlay({
    activeFloorId,
    activeBuilding,
    indoorMode,
    rooms,
    highlightedRoomId,
}) {
    const floorOutlineGeoJSON = useMemo(() => {
        if (!activeBuilding || activeFloorId == null) return null;
        const floor = activeBuilding.floors.find(f => f.floorId === activeFloorId);
        if (!floor?.outline) return null;
        return {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                properties: { floorId: activeFloorId },
                geometry: floor.outline,
            }],
        };
    }, [activeBuilding, activeFloorId]);

    if (!indoorMode) return null;

    const floorFilter = activeFloorId != null
        ? ['==', ['get', 'floorId'], activeFloorId]
        : ['==', ['get', 'z'], 1];

    // Use -1 as sentinel so the filter matches nothing when no room is highlighted
    const highlightFilter = ['==', ['get', 'poiId'], highlightedRoomId ?? -1];

    return (
        <>
            <Source id="indoor-rooms" type="geojson" data={rooms ?? EMPTY_GEOJSON}>
                <Layer
                    id="indoor-rooms-fill"
                    type="fill"
                    filter={floorFilter}
                    paint={{
                        'fill-color': FILL_COLOR,
                        'fill-opacity': 0.92,
                    }}
                />
                <Layer
                    id="indoor-rooms-outline"
                    type="line"
                    filter={floorFilter}
                    paint={{
                        'line-color': '#aaaaaa',
                        'line-width': 1.0,
                    }}
                />
                <Layer
                    id="indoor-room-labels"
                    type="symbol"
                    filter={floorFilter}
                    minzoom={18}
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
                    id="indoor-rooms-highlighted"
                    type="fill"
                    filter={highlightFilter}
                    paint={{
                        'fill-color': '#FFD700',
                        'fill-opacity': 1.0,
                    }}
                />
                <Layer
                    id="indoor-rooms-highlighted-outline"
                    type="line"
                    filter={highlightFilter}
                    paint={{
                        'line-color': '#FF6600',
                        'line-width': 3,
                    }}
                />
            </Source>

            {floorOutlineGeoJSON && (
                <Source id="indoor-floor-outline" type="geojson" data={floorOutlineGeoJSON}>
                    <Layer
                        id="indoor-floor-outline"
                        type="fill"
                        paint={{
                            'fill-opacity': 0,
                            'fill-outline-color': '#555555',
                        }}
                    />
                </Source>
            )}
        </>
    );
}
