"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { locations } from "../../data/locations";
import useIndoorData from "../../hooks/useIndoorData";
import { getRoomDisplayName, getRoomTypeName } from "../../lib/roomUtils";
import GlassCard from "../../components/ui/GlassCard";

const QR_LOCATION_IDS = new Set(['A-BLOCK','AG-BLOCK','C-BLOCK','CAFE','CONNECT','D-BLOCK','E-BLOCK','F-BLOCK','S-BLOCK']);

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

// FIX 2 — accordion section for a single floor
function FloorAccordion({ floor, rooms, openFloor, setOpenFloor, onRoomClick, roomNameMap }) {
    const isOpen = openFloor === floor;
    const label  = getFloorLabel(floor);

    return (
        <div style={{ marginBottom: 8 }}>
            {/* Header button */}
            <button
                onClick={() => setOpenFloor(isOpen ? null : floor)}
                style={{
                    width: '100%', height: 48,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 16px',
                    background: isOpen ? 'var(--accent-teal)' : 'var(--bg-card)',
                    color: isOpen ? '#fff' : 'var(--text-primary)',
                    border: 'none', borderRadius: 12,
                    cursor: 'pointer', fontWeight: 600, fontSize: 14,
                    transition: 'background 0.2s, color 0.2s',
                }}
            >
                <span>{label}</span>
                <span style={{ fontSize: 11, opacity: 0.8 }}>{isOpen ? '▲' : '▼'}</span>
            </button>

            {/* Collapsible room rows */}
            <div style={{
                maxHeight: isOpen ? 600 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.3s ease',
            }}>
                <div style={{
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid var(--glass-border)',
                    borderTop: 'none',
                    borderRadius: '0 0 12px 12px',
                    overflow: 'hidden',
                }}>
                    {rooms.map((f, i) => {
                        const p           = f.properties;
                        const displayName = getRoomDisplayName(p.roomCode, roomNameMap) || p.roomCode;
                        const typeName    = getRoomTypeName(p.roomCode, roomNameMap) || p.typeName || '';
                        const badgeStyle  = getRoomTypeBadgeStyle(typeName);
                        const isLast      = i === rooms.length - 1;
                        return (
                            <div
                                key={p.poiId}
                                onClick={() => onRoomClick(f)}
                                style={{
                                    minHeight: 44,
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '8px 16px',
                                    borderBottom: isLast ? 'none' : '1px solid var(--border-color)',
                                    cursor: 'pointer',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <span style={{
                                    fontSize: 14, color: 'var(--text-primary)',
                                    flex: 1, overflow: 'hidden',
                                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    paddingRight: 8,
                                }}>
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
            </div>
        </div>
    );
}

export default function LocationDetails() {
    const router = useRouter();
    const { id } = useParams();
    const [location, setLocation] = useState(null);
    const [loading, setLoading]   = useState(true);

    // FIX 2 — accordion state; default Ground floor open
    const [openFloor, setOpenFloor] = useState('G');

    const { rooms, roomNameMap } = useIndoorData();

    useEffect(() => {
        const found = locations.find(loc => loc.id.toUpperCase() === id?.toUpperCase());
        setLocation(found);
        setLoading(false);
    }, [id]);

    // FIX 1 — group by floor, deduplicate by displayName per floor
    const roomsByFloor = useMemo(() => {
        if (!rooms?.features || !location?.buildingId) return {};

        const groups = {};
        for (const f of rooms.features) {
            const p = f.properties;
            if (p.buildingId !== location.buildingId) continue;
            const t = (p.typeName || '').toLowerCase();
            const k = (p.kind    || '').toLowerCase();
            if (HIDDEN_KINDS.has(k)) continue;
            if (HIDDEN_TYPES.has(t) || t === 'plant room' || t === 'storage room') continue;

            const floor = String(p.floorName ?? 'G');
            if (!groups[floor]) groups[floor] = [];
            groups[floor].push(f);
        }

        // Deduplicate each floor group by displayName
        for (const floor of Object.keys(groups)) {
            const seen = new Set();
            groups[floor] = groups[floor].filter(f => {
                const name = getRoomDisplayName(f.properties.roomCode, roomNameMap) || f.properties.roomCode;
                if (seen.has(name)) return false;
                seen.add(name);
                return true;
            });
        }

        return groups;
    }, [rooms, location, roomNameMap]);

    // FIX 4 — navigate to map with selectedRoomId query param
    const handleRoomClick = (feature) => {
        router.push(`/?selectedRoomId=${feature.properties.poiId}`);
    };

    const handleNavigateToBuilding = () => {
        if (!location) return;
        const coords = location.coordinates;
        router.push(`/?navTo=${location.id}&lng=${coords[0]}&lat=${coords[1]}`);
    };

    if (loading) {
        return (
            <div style={{ height: '100dvh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Loading...</span>
            </div>
        );
    }

    if (!location) {
        return (
            <div style={{ height: '100dvh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
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

    const hasRooms = Object.keys(roomsByFloor).length > 0;

    return (
        // FIX 3 — full-height scrollable container with bottom padding
        <div style={{
            height: '100dvh',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            background: 'var(--bg-primary)',
            paddingBottom: 100,
        }}>

            {/* SECTION 1 — Hero image */}
            <div style={{ position: 'relative', width: '100%', height: 220, flexShrink: 0 }}>
                <img
                    src={location.image}
                    alt={location.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, var(--bg-primary) 0%, transparent 60%)',
                    pointerEvents: 'none',
                }} />
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
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6, margin: '8px 0 0' }}>
                        {location.description}
                    </p>
                )}
            </div>

            {/* SECTION 3 — Info cards */}
            <div style={{ padding: '16px 20px 0', display: 'flex', gap: 12 }}>
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

            {/* SECTION 4 — Room list accordion */}
            {hasRooms && (
                <div style={{ padding: '20px 20px 0' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                        Rooms in this building
                    </div>
                    {Object.entries(roomsByFloor).map(([floor, rms]) => (
                        <FloorAccordion
                            key={floor}
                            floor={floor}
                            rooms={rms}
                            openFloor={openFloor}
                            setOpenFloor={setOpenFloor}
                            onRoomClick={handleRoomClick}
                            roomNameMap={roomNameMap}
                        />
                    ))}
                </div>
            )}

            {/* SECTION 5 — QR code */}
            {QR_LOCATION_IDS.has(location.id) && (
                <div style={{ padding: '0 20px', marginTop: 16 }}>
                    <GlassCard style={{ padding: 20, marginTop: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 18 }}>📱</span>
                            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Share this location</span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 12px' }}>
                            Scan to open on another device
                        </p>
                        <img
                            src={`https://campusquesttud.s3.eu-west-1.amazonaws.com/photos/qr/${location.id}.png`}
                            alt={`QR code for ${location.name}`}
                            onError={e => e.currentTarget.style.display = 'none'}
                            style={{
                                width: 140, height: 140,
                                borderRadius: 12,
                                display: 'block',
                                margin: '0 auto',
                                background: '#fff',
                                padding: 8,
                            }}
                        />
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center', margin: '8px 0 0' }}>
                            Point your camera at the code
                        </p>
                    </GlassCard>
                </div>
            )}

            {/* SECTION 6 — Action buttons */}
            <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
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
