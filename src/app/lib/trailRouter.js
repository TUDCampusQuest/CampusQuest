// BFS-based trail path builder using the campus graph.
// Self-contained — does not import from useNavigation or hooks.

function findPathBFS(startId, endId, edges) {
  const adj = {};
  for (const e of edges) {
    if (!adj[e.from]) adj[e.from] = [];
    if (!adj[e.to])   adj[e.to]   = [];
    adj[e.from].push(e.to);
    adj[e.to].push(e.from);
  }
  const queue = [[startId]];
  const visited = new Set([startId]);
  while (queue.length) {
    const path = queue.shift();
    const cur = path[path.length - 1];
    if (cur === endId) return path;
    for (const nb of (adj[cur] ?? [])) {
      if (!visited.has(nb)) {
        visited.add(nb);
        queue.push([...path, nb]);
      }
    }
  }
  return null;
}

function findNearestNodeId(lng, lat, nodes) {
  const R = 6371000;
  const r = d => d * Math.PI / 180;
  let best = null, bestDist = Infinity;
  for (const n of nodes) {
    const dLat = r(n.lat - lat);
    const dLng = r(n.lng - lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(r(lat)) * Math.cos(r(n.lat)) * Math.sin(dLng / 2) ** 2;
    const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (d < bestDist) { bestDist = d; best = n.id; }
  }
  return best;
}

export function buildTrailPath(stops, campusGraph) {
  if (!stops || stops.length < 2) return [];
  if (!campusGraph) return stops.map(s => [s.lng, s.lat]);

  const nodes = campusGraph.campusNodes ?? campusGraph.nodes ?? [];
  const edges = campusGraph.campusEdges ?? campusGraph.edges ?? [];
  const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]));

  if (!nodes.length || !edges.length) {
    return stops.map(s => [s.lng, s.lat]);
  }

  const fullPath = [];

  for (let i = 0; i < stops.length - 1; i++) {
    const fromStop = stops[i];
    const toStop   = stops[i + 1];

    const fromNodeId = findNearestNodeId(fromStop.lng, fromStop.lat, nodes);
    const toNodeId   = findNearestNodeId(toStop.lng,   toStop.lat,   nodes);

    if (!fromNodeId || !toNodeId) {
      if (fullPath.length === 0) fullPath.push([fromStop.lng, fromStop.lat]);
      fullPath.push([toStop.lng, toStop.lat]);
      continue;
    }

    const pathIds = findPathBFS(fromNodeId, toNodeId, edges);

    if (!pathIds) {
      if (fullPath.length === 0) fullPath.push([fromStop.lng, fromStop.lat]);
      fullPath.push([toStop.lng, toStop.lat]);
      continue;
    }

    const coords = pathIds
      .map(id => nodeById[id])
      .filter(Boolean)
      .map(n => [n.lng, n.lat]);

    if (fullPath.length === 0 && coords.length > 0) fullPath.push(coords[0]);
    for (let j = 1; j < coords.length; j++) fullPath.push(coords[j]);
  }

  return fullPath;
}

export function calcTrailDistance(path) {
  const R = 6371000;
  const r = d => d * Math.PI / 180;
  return Math.round(
    path.reduce((sum, c, i) => {
      if (i === 0) return sum;
      const [lng1, lat1] = path[i - 1];
      const [lng2, lat2] = c;
      const dLat = r(lat2 - lat1), dLng = r(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLng / 2) ** 2;
      return sum + R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }, 0)
  );
}
