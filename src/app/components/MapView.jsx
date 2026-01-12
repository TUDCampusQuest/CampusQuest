'use client';

import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import locations from '../data/locations';

export default function MapView({ onSelectLocation }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!window.google || !window.google.maps) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 53.405292, lng: -6.378240 }, // TU Dublin Blanchardstown
      zoom: 16,
      mapTypeControl: false,
      fullscreenControl: false,
    });

    locations.forEach((location) => {
      const marker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map,
        title: location.name,
      });

      marker.addListener('click', () => {
        onSelectLocation(location);
      });
    });
  }, [onSelectLocation]);

  return (
    <Box
      ref={mapRef}
      sx={{
        width: '100%',
        height: '100%',
      }}
    />
  );
}
