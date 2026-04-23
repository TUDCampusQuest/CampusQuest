'use client';

import { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl';
import { INDOOR_ROOMS_GEOJSON } from '../data/mazemap-indoorRooms';

const KIND_COLOR = [
    'match', ['get', 'kind'],
    'room', '#e8e0f0',
    'stairs', '#d4e8d4',
    'elevator', '#d4e4f4',
    'circulation_room', '#f0e8d4',
    '#ece8e0',
];

export default function IndoorOverlay({ activeFloorId, activeBuilding, indoorMode }) {
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

    return (
        <>
            <Source id="indoor-rooms" type="geojson" data={INDOOR_ROOMS_GEOJSON}>
                <Layer
                    id="indoor-rooms-fill"
                    type="fill"
                    filter={floorFilter}
                    paint={{
                        'fill-color': KIND_COLOR,
                        'fill-opacity': 0.85,
                    }}
                />
                <Layer
                    id="indoor-rooms-outline"
                    type="line"
                    filter={floorFilter}
                    paint={{
                        'line-color': '#888888',
                        'line-width': 0.8,
                    }}
                />
                <Layer
                    id="indoor-room-labels"
                    type="symbol"
                    filter={floorFilter}
                    minzoom={18.5}
                    layout={{
                        'text-field': ['get', 'roomCode'],
                        'text-size': 10,
                        'text-allow-overlap': false,
                        'text-ignore-placement': false,
                    }}
                    paint={{
                        'text-color': '#333333',
                        'text-halo-color': '#ffffff',
                        'text-halo-width': 1,
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
