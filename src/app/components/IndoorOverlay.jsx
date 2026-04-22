'use client';

import { Source, Layer } from 'react-map-gl';
import { getFloor } from '../data/floorplans';

export default function IndoorOverlay({
  isIndoorMode,
  buildingId,
  activeFloor,
  opacity = 0.9,
}) {
  if (!isIndoorMode || !buildingId || activeFloor == null) return null;

  const floor = getFloor(buildingId, activeFloor);
  if (!floor || !floor.image || !floor.coordinates) return null;

  const sourceId = `indoor-${buildingId}-${activeFloor}`;
  const layerId = `${sourceId}-layer`;

  return (
    <Source
      key={sourceId}
      id={sourceId}
      type="image"
      url={floor.image}
      coordinates={floor.coordinates}
    >
      <Layer
        id={layerId}
        type="raster"
        source={sourceId}
        paint={{
          'raster-opacity': opacity,
          'raster-fade-duration': 200,
        }}
      />
    </Source>
  );
}
