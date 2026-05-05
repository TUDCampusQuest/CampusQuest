// Campus bounding box used for map maxBounds, GPS validation, and
// off-campus fallback handling. Keep aligned with MapView's CAMPUS_BOUNDS prop.
export const CAMPUS_BOUNDS = {
    west:  -6.395,
    south: 53.398,
    east:  -6.360,
    north: 53.415,
};

export function isWithinCampus(lng, lat) {
    if (typeof lng !== 'number' || typeof lat !== 'number' || Number.isNaN(lng) || Number.isNaN(lat)) {
        return false;
    }
    return (
        lat >= CAMPUS_BOUNDS.south && lat <= CAMPUS_BOUNDS.north &&
        lng >= CAMPUS_BOUNDS.west  && lng <= CAMPUS_BOUNDS.east
    );
}

export function filterToCampus(coords) {
    if (!Array.isArray(coords)) return [];
    return coords.filter(c => Array.isArray(c) && c.length >= 2 && isWithinCampus(c[0], c[1]));
}
