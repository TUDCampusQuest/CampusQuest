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
  const infoWindowRef = useRef(null);

  const SPORTS_COLOR = '#b61352';
  const TECH_COLOR = '#4169E1';

  useEffect(() => {
    if (!window.google || !window.google.maps) return;

    //Create map once
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 53.405292, lng: -6.378240 },
        zoom: 18,
        mapTypeId: 'hybrid',
        mapTypeControl: false,
        fullscreenControl: false,
      });

      infoWindowRef.current = new window.google.maps.InfoWindow();
    }

    const map = mapInstanceRef.current;

    //Clear markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    //Clear polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    //Default mode
    if (!selectedTrail) {
      locations
        .filter((l) => l.type === 'default')
        .forEach((loc) => {
          const marker = new window.google.maps.Marker({
            position: { lat: loc.lat, lng: loc.lng },
            map,
            title: loc.name,
          });

          marker.addListener('click', () => {
            infoWindowRef.current.setContent(`
              <div style="max-width:220px">
                <strong>${loc.name}</strong><br/>
                ${loc.description ?? ''}<br/>
                <em>${loc.accessibility ?? ''}</em>
              </div>
            `);
            infoWindowRef.current.open(map, marker);
          });

          markersRef.current.push(marker);
        });

      return;
    }

    //Trail mode
    const trailStops = locations
      .filter(
        (l) =>
          l.type === 'trail' &&
          l.trail === selectedTrail
      )
      .sort((a, b) => a.order - b.order);

    const isTechTrail = selectedTrail === 'Technology Trail';

    trailStops.forEach((stop) => {
      const marker = new window.google.maps.Marker({
        position: { lat: stop.lat, lng: stop.lng },
        map,
        label: {
          text: `${isTechTrail ? 'T' : 'S'}${stop.order}`,
          color: 'white',
          fontWeight: 'bold',
        },
        title: stop.name,
      });

      marker.addListener('click', () => {
        infoWindowRef.current.setContent(`
          <div style="max-width:220px">
            <strong>${stop.name}</strong><br/>
            ${stop.description ?? ''}<br/>
            <em>${stop.accessibility ?? ''}</em>
          </div>
        `);
        infoWindowRef.current.open(map, marker);
      });

      markersRef.current.push(marker);
    });

    //Draw trail polyline
    const path = trailPaths[selectedTrail];
    if (!path || path.length === 0) return;

    polylineRef.current = new window.google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: isTechTrail ? TECH_COLOR : SPORTS_COLOR,
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
