'use client';

import { useMemo } from 'react';

function haversineM(lng1, lat1, lng2, lat2) {
  const R = 6371000, r = d => d * Math.PI / 180;
  const dLat = r(lat2 - lat1), dLng = r(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) *
    Math.cos(r(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function useGeofence({ userLocation, entrances }) {
  const nearestEntrance = useMemo(() => {
    if (!userLocation || !entrances?.length) return null;

    let closest = null;
    let closestDist = Infinity;

    for (const entrance of entrances) {
      const dist = haversineM(
        userLocation.lng, userLocation.lat,
        entrance.lng, entrance.lat,
      );
      if (dist < closestDist) {
        closestDist = dist;
        closest = entrance;
      }
    }

    return closestDist <= 20 ? closest : null;
  }, [userLocation, entrances]);

  return { nearestEntrance };
}
