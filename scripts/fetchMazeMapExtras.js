// MazeMap Data Fetcher v2 — Fixed for actual API response format
// Run with: node scripts/fetchMazeMapExtras.js

const fs = require('fs');
const path = require('path');

const CAMPUS_ID = 736;
const BASE = 'https://api.mazemap.com';
const OUT = path.join(__dirname, '..');

async function fetchJSON(url, label) {
  console.log(`  Fetching ${label}...`);
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) { console.warn(`  Warning: HTTP ${res.status}`); return null; }
  return res.json();
}

function write(filename, data) {
  fs.writeFileSync(path.join(OUT, filename), JSON.stringify(data, null, 2));
  console.log(`  Wrote ${filename}`);
}

async function main() {
  console.log('\n=== MazeMap Data Fetcher v2 ===\n');

  // Fetch all POIs
  const raw = await fetchJSON(
    `${BASE}/api/pois/?campusid=${CAMPUS_ID}&srid=4326&lang=en`,
    'all POIs'
  );
  const pois = raw?.pois ?? [];
  console.log(`  → ${pois.length} POIs found`);
  write('mazemap-pois-full.json', raw);

  // Build clean room name map
  const nameMap = {};
  for (const p of pois) {
    const roomCode = p.title || '';
    if (!roomCode) continue;

    const typeName = p.types?.[0]?.name ?? '';
    const iconId   = p.types?.[0]?.iconId ?? null;
    const point    = p.point?.coordinates ?? [];

    // Best display name: highest priority info entry that isnt
    // the room code itself and isnt a meaningless placeholder
    let bestName = null;
    const sortedInfos = [...(p.infos ?? [])]
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    for (const info of sortedInfos) {
      const name = info.name ?? '';
      const isCode = name === roomCode;
      const isPlaceholder = name.length <= 2 || name.includes('m²') ||
        (name.length === 4 && /^[A-Z]\d{3}$/.test(name));
      if (!isCode && !isPlaceholder && name.length > 2) {
        bestName = name;
        break;
      }
    }

    nameMap[roomCode] = {
      poiId:       p.poiId,
      displayName: bestName ?? roomCode,
      hasRealName: !!(bestName && bestName !== roomCode),
      typeName,
      iconId,
      buildingId:   p.buildingId,
      buildingName: p.buildingName,
      floorName:    p.floorName,
      lng: point[0] ?? null,
      lat: point[1] ?? null,
    };
  }

  const realNames = Object.values(nameMap).filter(v => v.hasRealName).length;
  console.log(`  → ${realNames} rooms with real display names`);
  console.log(`  → ${pois.length - realNames} rooms code-only`);
  write('room-name-map.json', nameMap);

  // Extract building entrances
  const entrances = pois
    .filter(p => p.types?.some(t =>
      ['entrance', 'main entrance'].includes(t.name?.toLowerCase())
    ))
    .map(p => ({
      id:                  `entrance-${p.poiId}`,
      buildingName:        p.buildingName ?? '',
      buildingId:          p.buildingId ?? '',
      label:               p.title ?? 'Entrance',
      lng:                 p.point?.coordinates?.[0] ?? null,
      lat:                 p.point?.coordinates?.[1] ?? null,
      triggerRadiusMetres: 20,
    }))
    .filter(e => e.lng && e.lat);

  console.log(`  → ${entrances.length} building entrances extracted`);
  write('entrance-coordinates.json', entrances);

  console.log('\n=== Done ===');
  console.log('\nKey files:');
  console.log('  room-name-map.json         — roomCode → displayName (upload to S3)');
  console.log('  entrance-coordinates.json  — building entrances (use for geofencing)');
}

main().catch(e => { console.error('Failed:', e.message); process.exit(1); });