'use client';

import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import locations from '../data/locations';
import trailPaths from '../data/trailPaths';

export default function MapView({ selectedTrail }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  useEffect(() => {
    if (!window.google || !window.google.maps) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 53.405292, lng: -6.378240 },
        zoom: 18,
        mapTypeId: 'hybrid',
        mapTypeControl: false,
        fullscreenControl: false,
      });
    }

    const map = mapInstanceRef.current;

    // Clear markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Clear polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    // ============================
    // DEFAULT MODE
    // ============================
    if (!selectedTrail) {
      locations
        .filter((l) => l.type === 'default')
        .forEach((loc) => {
          const marker = new window.google.maps.Marker({
            position: { lat: loc.lat, lng: loc.lng },
            map,
            title: loc.name,
          });
          markersRef.current.push(marker);
        });
      return;
    }

    // ============================
    // TRAIL MODE
    // ============================
    const trailStops = locations
      .filter(
        (l) =>
          l.type === 'trail' &&
          l.trail === selectedTrail
      )
      .sort((a, b) => a.order - b.order);

    trailStops.forEach((stop) => {
      const marker = new window.google.maps.Marker({
        position: { lat: stop.lat, lng: stop.lng },
        map,
        label: {
          text: `S${stop.order}`,
          color: 'white',
          fontWeight: 'bold',
        },
        title: stop.name,
      });
      markersRef.current.push(marker);
    });

    const path = trailPaths[selectedTrail];
    if (!path) return;

    polylineRef.current = new window.google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#da0e5c',
      strokeOpacity: 0.95,
      strokeWeight: 5,
    });

    polylineRef.current.setMap(map);
    map.panTo(path[0]);

  }, [selectedTrail]);

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
