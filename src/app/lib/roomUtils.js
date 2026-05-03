/**
 * Returns the human-readable display name for a room if one exists in the
 * name map, otherwise falls back to the raw room code.
 */
export function getRoomDisplayName(roomCode, roomNameMap) {
    if (!roomNameMap || !roomCode) return roomCode;
    const entry = roomNameMap[roomCode];
    if (!entry || !entry.hasRealName) return roomCode;
    return entry.displayName;
}

/**
 * Returns the typeName (e.g. "Sports Hall", "Computer Lab") for a room, or
 * null when the map has no entry or no type for the given code.
 */
export function getRoomTypeName(roomCode, roomNameMap) {
    if (!roomNameMap || !roomCode) return null;
    return roomNameMap[roomCode]?.typeName ?? null;
}
