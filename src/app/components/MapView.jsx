'use client';
import { Map, Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useMemo } from 'react';
import { locations } from '../data/locations';

export default function MapView() {
  const [selectedLoc, setSelectedLoc] = useState(null);

  // Safety check for your AWS data format
  const markers = useMemo(() => {
    return locations.map((loc) => (
      <Marker
        key={loc.id}
        longitude={loc.coordinates ? loc.coordinates[0] : loc.lng}
        latitude={loc.coordinates ? loc.coordinates[1] : loc.lat}
        anchor="bottom"
        onClick={e => {
          e.originalEvent.stopPropagation();
          setSelectedLoc(loc);
        }}
      >
        <div style={{ cursor: 'pointer', fontSize: '24px' }}>📍</div>
      </Marker>
    ));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        initialViewState={{
          longitude: -6.378240,
          latitude: 53.405292,
          zoom: 16
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        <NavigationControl position="top-right" />
        {markers}

        {selectedLoc && (
          <Popup
            longitude={selectedLoc.coordinates ? selectedLoc.coordinates[0] : selectedLoc.lng}
            latitude={selectedLoc.coordinates ? selectedLoc.coordinates[1] : selectedLoc.lat}
            anchor="top"
            onClose={() => setSelectedLoc(null)}
          >
            <div style={{ color: '#333', padding: '5px' }}>
              <h3 style={{ margin: 0 }}>{selectedLoc.name}</h3>
              <p>Building {selectedLoc.id}</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}