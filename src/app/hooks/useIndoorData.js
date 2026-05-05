'use client';

import { useState, useEffect } from 'react';

let cache = null;

async function fetchAll() {
  if (cache) return cache;

  const files = [
    'indoor/rooms',
    'indoor/stairs',
    'indoor/floorplans',
    'indoor/room-name-map',
    'indoor/entrances',
    'buildings/locations',
    'routing/campusGraph',
    'routing/buildingRoutes',
    'data/buildings',
  ];

  const results = await Promise.all(
    files.map(f => fetch(`/api/indoor?file=${f}`).then(r => r.json()))
  );

  cache = {
    rooms:          results[0],
    stairs:         results[1],
    floorplans:     results[2],
    roomNameMap:    results[3],
    entrances:      results[4],
    locations:      results[5],
    campusGraph:    results[6],
    buildingRoutes: results[7],
    buildings:      results[8]?.buildings     ?? [],
    buildingLookup: results[8]?.buildingLookup ?? {},
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
