export const FLOORPLANS = {
  'F-BLOCK': {
    name: 'Block F',
    center: [-6.378376, 53.404758],
    floors: {
      0: {
        label: 'G',
        displayName: 'Ground Floor',
        image: '/floorplans/block-f/floor-0.png',
        coordinates: [
          [-6.378947, 53.404758],
          [-6.378119, 53.405117],
          [-6.377602, 53.404625],
          [-6.378456, 53.404264],
        ],
      },
      1: {
        label: 'F1',
        displayName: 'Library Floor',
        image: '/floorplans/block-f/floor-1.png',
        coordinates: [
          [-6.378996, 53.404726],
          [-6.378085, 53.405188],
          [-6.377592, 53.404648],
          [-6.378490, 53.404258],
        ],
      },
      2: {
        label: 'F2',
        displayName: 'Upper Floor',
        image: '/floorplans/block-f/floor-2.png',
        coordinates: [
          [-6.378927, 53.404755],
          [-6.378070, 53.405082],
          [-6.377612, 53.404616],
          [-6.378387, 53.404283],
        ],
      },
    },
  },
};

export const INDOOR_BUILDINGS = Object.keys(FLOORPLANS);

export function getFloor(buildingId, floor) {
  const b = FLOORPLANS[buildingId];
  if (!b) return null;
  return b.floors[floor] ?? null;
}

export function getFloorNumbers(buildingId) {
  const b = FLOORPLANS[buildingId];
  if (!b) return [];
  return Object.keys(b.floors)
    .map(Number)
    .sort((a, z) => z - a);
}
