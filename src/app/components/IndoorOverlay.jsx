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
    activeFloorName,
    activeBuilding,
    rooms,
    highlightedRoomId,
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

    const floorFilter = activeFloorName
        ? ['==', ['get', 'floorName'], activeFloorName]
        : ['literal', true];

    // -1 sentinel → matches nothing when no room is selected
    const highlightFilter = ['==', ['get', 'poiId'], highlightedRoomId ?? -1];

    return (
        <>
            <Source id="indoor-rooms" type="geojson" data={rooms ?? EMPTY_GEOJSON}>
                {/* Room fills — visible from zoom 17 */}
                <Layer
                    id="indoor-rooms-fill"
                    type="fill"
                    minzoom={17}
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

                {/* Highlighted room — thick coloured outline only so the label stays readable */}
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
        </>
    );
}
