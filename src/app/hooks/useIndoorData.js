'use client';

import { useState, useEffect } from 'react';

let cache = null;

async function fetchAll() {
  if (cache) return cache;

  const files = [
    'indoor/rooms',
    'indoor/stairs',
    'indoor/floorplans',
    'buildings/locations',
    'routing/campusGraph',
    'routing/buildingRoutes',
  ];

  const results = await Promise.all(
    files.map(f => fetch(`/api/indoor?file=${f}`).then(r => r.json()))
  );

  cache = {
    rooms:          results[0],
    stairs:         results[1],
    floorplans:     results[2],
    locations:      results[3],
    campusGraph:    results[4],
    buildingRoutes: results[5],
  };

  return cache;
}

export default function useIndoorData() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

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