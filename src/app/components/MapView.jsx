'use client';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useMemo } from 'react';
import { locations } from '../data/locations';

export default function MapView({ viewState, onMove, onMapLoad }) {
  const [selectedLoc, setSelectedLoc] = useState(null);

  const markers = useMemo(() => {
    return (locations || []).map((loc) => {
      const lng = loc.coordinates ? loc.coordinates[0] : loc.lng;
      const lat = loc.coordinates ? loc.coordinates[1] : loc.lat;
      if (typeof lng !== 'number' || typeof lat !== 'number') return null;

      return (
        <Marker
          key={loc.id}
          longitude={lng}
          latitude={lat}
          anchor="bottom"
          onClick={e => {
            e.originalEvent.stopPropagation();
            setSelectedLoc(loc);
          }}
        >
          <div style={{ cursor: 'pointer', fontSize: '24px' }}>📍</div>
        </Marker>
      );
    });
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Map
        {...viewState}
        onMove={onMove}
        onLoad={(e) => {
          onMapLoad(e.target);
          // Standard style handles 3D buildings internally.
          // We no longer need map.addLayer('3d-buildings') with 'composite' source.
        }}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/standard" 
      >
        <NavigationControl position="top-right" showCompass={true} />
        {markers}

        {selectedLoc && (
          <Popup
            longitude={selectedLoc.coordinates ? selectedLoc.coordinates[0] : selectedLoc.lng}
            latitude={selectedLoc.coordinates ? selectedLoc.coordinates[1] : selectedLoc.lat}
            anchor="top"
            onClose={() => setSelectedLoc(null)}
          >
            <div style={{ color: '#333', padding: '5px', fontFamily: 'sans-serif' }}>
              <h3 style={{ margin: 0, fontSize: '14px' }}>{selectedLoc.name}</h3>
              <p style={{ margin: 0, fontSize: '12px' }}>Building {selectedLoc.id}</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}