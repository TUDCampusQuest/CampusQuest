'use client';

import { useState, useEffect } from 'react';

let cache = null;

async function safeFetch(file) {
  try {
    const r = await fetch(`/api/indoor?file=${file}`);
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

async function fetchAll() {
  if (cache) return cache;

  const [
    rooms, stairs, floorplans, roomNameMap,
    locations, campusGraph, buildingRoutes, buildingsData,
  ] = await Promise.all([
    safeFetch('indoor/rooms'),
    safeFetch('indoor/stairs'),
    safeFetch('indoor/floorplans'),
    safeFetch('indoor/room-name-map'),
    safeFetch('buildings/locations'),
    safeFetch('routing/campusGraph'),
    safeFetch('routing/buildingRoutes'),
    safeFetch('data/buildings'),
  ]);

  cache = {
    rooms,
    stairs,
    floorplans,
    roomNameMap,
    locations,
    campusGraph,
    buildingRoutes,
    buildings:      buildingsData?.buildings     ?? [],
    buildingLookup: buildingsData?.buildingLookup ?? {},
  };

  return cache;
}

export default function useIndoorData() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetchAll()
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { ...data, loading, error };
}
