"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { locations } from "../../data/locations";
import useIndoorData from "../../hooks/useIndoorData";
import { getRoomDisplayName, getRoomTypeName } from "../../lib/roomUtils";

const FLOOR_LABELS = { G: 'Ground Floor', '0': 'Ground Floor', '1': 'First Floor', '2': 'Second Floor', '3': 'Third Floor' };
const HIDDEN_TYPES = new Set(['circulation', 'plant', 'storage']);
const HIDDEN_KINDS = new Set(['circulation_room']);

function getFloorLabel(floorName) {
    return FLOOR_LABELS[String(floorName)] || `Floor ${floorName}`;
}

function getRoomTypeBadgeStyle(typeName) {
    const t = (typeName || '').toLowerCase();
    if (t.includes('lecture') || t.includes('theatre') || t.includes('auditorium'))
        return { background: '#7C3AED22', color: 'var(--accent-purple)' };
    if (t.includes('computer') || t.includes('lab'))
        return { background: '#00B4B422', color: 'var(--accent-teal)' };
    if (t.includes('laborator'))
        return { background: '#E67E2222', color: '#E67E22' };
    if (t.includes('toilet') || t.includes('wc') || t.includes('bathroom') || t.includes('washroom'))
        return { background: '#94A3B822', color: 'var(--text-secondary)' };
    if (t.includes('stair'))
        return { background: '#FFB34722', color: '#E67E22' };
    return { background: 'var(--bg-card)', color: 'var(--text-secondary)' };
}

export default function LocationDetails() {
    const router = useRouter();
    const { id } = useParams();
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAllRooms, setShowAllRooms] = useState(false);

    const { rooms, roomNameMap } = useIndoorData();

    useEffect(() => {
        const found = locations.find(loc => loc.id.toUpperCase() === id?.toUpperCase());
        setLocation(found);
        setLoading(false);
    }, [id]);

    const roomsByFloor = useMemo(() => {
        if (!rooms?.features || !location?.buildingId) return {};
        const filtered = rooms.features.filter(f => {
            const p = f.properties;
            if (p.buildingId !== location.buildingId) return false;
            const t = (p.typeName || '').toLowerCase();
            const k = (p.kind || '').toLowerCase();
            if (HIDDEN_KINDS.has(k)) return false;
            if (HIDDEN_TYPES.has(t) || t === 'plant room' || t === 'storage room') return false;
            return true;
        });

        const groups = {};
        for (const f of filtered) {
            const floor = String(f.properties.floorName ?? 'G');
            if (!groups[floor]) groups[floor] = [];
            groups[floor].push(f);
        }
        return groups;
    }, [rooms, location]);

    const allRoomsFlat = useMemo(() => Object.values(roomsByFloor).flat(), [roomsByFloor]);
    const totalRooms = allRoomsFlat.length;
    const LIMIT = 40;

    const displayedByFloor = useMemo(() => {
        if (showAllRooms || totalRooms <= LIMIT) return roomsByFloor;
        let remaining = LIMIT;
        const result = {};
        for (const [floor, rms] of Object.entries(roomsByFloor)) {
            if (remaining <= 0) break;
            result[floor] = rms.slice(0, remaining);
            remaining -= rms.length;
        }
        return result;
    }, [roomsByFloor, showAllRooms, totalRooms]);

    const handleNavigateToBuilding = () => {
        if (!location) return;
        // Encode the destination as a query param so page.js can trigger navigation
        const coords = location.coordinates;
        router.push(`/?navTo=${location.id}&lng=${coords[0]}&lat=${coords[1]}`);
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Loading...</span>
            </div>
        );
    }

    if (!location) {
        return (
            <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 20 }}>Location Not Found</span>
                <button
                    onClick={() => router.push('/')}
                    style={{ background: 'var(--accent-teal)', color: '#fff', border: 'none', borderRadius: 14, padding: '12px 28px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
                >
                    Back to Map
                </button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)', overflowY: 'auto' }}>

            {/* SECTION 1 — Hero image */}
            <div style={{ position: 'relative', width: '100%', height: 220, flexShrink: 0 }}>
                <img
                    src={location.image}
                    alt={location.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {/* Bottom gradient overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, var(--bg-primary) 0%, transparent 60%)',
                    pointerEvents: 'none',
                }} />
                {/* Back arrow */}
                <button
                    onClick={() => router.back()}
                    aria-label="Go back"
                    style={{
                        position: 'absolute', top: 16, left: 16,
                        width: 40, height: 40, borderRadius: '50%',
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid var(--glass-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#fff', fontSize: 20,
                    }}
                >
                    ←
                </button>
            </div>

            {/* SECTION 2 — Building identity */}
            <div style={{ padding: '0 20px', marginTop: -40, position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                        {location.name}
                    </span>
                    <span style={{
                        background: 'var(--accent-purple)', color: '#fff',
                        fontSize: 12, fontWeight: 700, borderRadius: 20,
                        padding: '3px 10px', display: 'inline-block',
                    }}>
                        {location.id}
                    </span>
                </div>
                {location.description && (
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 }}>
                        {location.description}
                    </p>
                )}
            </div>

            {/* SECTION 3 — Info cards */}
            <div style={{ padding: '16px 20px 0', display: 'flex', gap: 12 }}>
                {/* Floors card */}
                <div style={{
                    flex: 1, padding: 14,
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid var(--glass-border)',
                    borderTop: '2px solid var(--accent-purple)',
                    borderRadius: 16,
                    boxShadow: 'var(--card-shadow)',
                }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>🏢</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>Floors</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginTop: 3 }}>
                        {location.floors?.join(', ') || 'N/A'}
                    </div>
                </div>
                {/* Access card */}
                <div style={{
                    flex: 1, padding: 14,
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid var(--glass-border)',
                    borderTop: '2px solid var(--accent-teal)',
                    borderRadius: 16,
                    boxShadow: 'var(--card-shadow)',
                }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>♿</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>Access</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginTop: 3 }}>Full Access</div>
                </div>
            </div>

            {/* SECTION 4 — Room list */}
            {Object.keys(displayedByFloor).length > 0 && (
                <div style={{ padding: '20px 20px 0' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
                        Rooms in this building
                    </div>

                    <div style={{
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid var(--glass-border)',
                        borderTop: '2px solid var(--accent-purple)',
                        borderRadius: 16,
                        boxShadow: 'var(--card-shadow)',
                        overflow: 'hidden',
                    }}>
                        {Object.entries(displayedByFloor).map(([floor, rms]) => (
                            <div key={floor}>
                                {/* Floor heading */}
                                <div style={{
                                    fontSize: 11, fontWeight: 600,
                                    color: 'var(--accent-teal)',
                                    textTransform: 'uppercase', letterSpacing: '0.07em',
                                    padding: '12px 16px 6px',
                                }}>
                                    {getFloorLabel(floor)}
                                </div>
                                {rms.map((f, i) => {
                                    const p = f.properties;
                                    const displayName = getRoomDisplayName(p.roomCode, roomNameMap) || p.roomCode;
                                    const typeName = getRoomTypeName(p.roomCode, roomNameMap) || p.typeName || '';
                                    const badgeStyle = getRoomTypeBadgeStyle(typeName);
                                    const isLast = i === rms.length - 1;
                                    return (
                                        <div
                                            key={p.poiId}
                                            style={{
                                                height: 44,
                                                display: 'flex', alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '0 16px',
                                                borderBottom: isLast ? 'none' : '1px solid var(--border-color)',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => router.push(`/?roomId=${p.poiId}`)}
                                        >
                                            <span style={{ fontSize: 14, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                                                {displayName}
                                            </span>
                                            {typeName && (
                                                <span style={{
                                                    ...badgeStyle,
                                                    fontSize: 10, fontWeight: 600,
                                                    borderRadius: 20, padding: '2px 8px',
                                                    whiteSpace: 'nowrap', flexShrink: 0,
                                                }}>
                                                    {typeName}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}

                        {!showAllRooms && totalRooms > LIMIT && (
                            <button
                                onClick={() => setShowAllRooms(true)}
                                style={{
                                    width: '100%', padding: '12px 16px',
                                    background: 'transparent',
                                    borderTop: '1px solid var(--border-color)',
                                    border: 'none', borderTop: '1px solid var(--border-color)',
                                    color: 'var(--accent-teal)', fontWeight: 600, fontSize: 13,
                                    cursor: 'pointer', textAlign: 'center',
                                }}
                            >
                                View all {totalRooms} rooms
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* SECTION 5 — Action buttons */}
            <div style={{ padding: '20px 20px 40px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                    onClick={handleNavigateToBuilding}
                    style={{
                        width: '100%', height: 52,
                        background: 'var(--accent-teal)',
                        color: '#fff', fontWeight: 700, fontSize: 15,
                        border: 'none', borderRadius: 14, cursor: 'pointer',
                        letterSpacing: '0.01em',
                    }}
                >
                    Navigate to Building
                </button>
                <button
                    onClick={() => router.push('/')}
                    style={{
                        width: '100%', height: 52,
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)', fontWeight: 600, fontSize: 15,
                        borderRadius: 14, cursor: 'pointer',
                    }}
                >
                    Back to Map
                </button>
            </div>
        </div>
    );
}
