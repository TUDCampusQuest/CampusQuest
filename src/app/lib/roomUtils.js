// Looks up human-readable room names and type labels from the room name map.
export function getRoomDisplayName(roomCode, roomNameMap) {
    if (!roomNameMap || !roomCode) return roomCode;
    const entry = roomNameMap[roomCode];
    if (!entry || !entry.hasRealName) return roomCode;
    return entry.displayName;
}

export function getRoomTypeName(roomCode, roomNameMap) {
    if (!roomNameMap || !roomCode) return null;
    return roomNameMap[roomCode]?.typeName ?? null;
}
