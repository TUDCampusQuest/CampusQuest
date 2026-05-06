'use client';
// Full-page building detail view showing rooms, floors, a QR share card, and a navigate button.

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { locations } from "../../data/locations";
import useIndoorData from "../../hooks/useIndoorData";
import { getRoomDisplayName } from "../../lib/roomUtils";
import LocationHero from "../../components/LocationHero";
import LocationShareCard from "../../components/LocationShareCard";
import FloorAccordion from "../../components/FloorAccordion";

const QR_LOCATION_IDS = new Set(['A-BLOCK','AG-BLOCK','C-BLOCK','CAFE','CONNECT','D-BLOCK','E-BLOCK','F-BLOCK','S-BLOCK']);
const HIDDEN_TYPES    = new Set(['circulation', 'plant', 'storage']);
const HIDDEN_KINDS    = new Set(['circulation_room']);

export default function LocationDetailsClient({ id }) {
    const router = useRouter();
    const [location,  setLocation]  = useState(null);
    const [loading,   setLoading]   = useState(true);
    const [openFloor, setOpenFloor] = useState('G');
    const [pageUrl,   setPageUrl]   = useState(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://campusquest.vercel.app'}/location/${id}`
    );

    useEffect(() => {
        const base = process.env.NEXT_PUBLIC_APP_URL ||
            (typeof window !== 'undefined' ? window.location.origin : '') ||
            'https://campusquest.vercel.app';
        setPageUrl(`${base.replace(/\/$/, '')}/location/${id}`);
    }, [id]);

    const { rooms, roomNameMap } = useIndoorData();

    useEffect(() => {
        const found = locations.find(loc => loc.id.toUpperCase() === id?.toUpperCase());
        setLocation(found ?? null);
        setLoading(false);
    }, [id]);

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

    if (loading) return (
        <div style={{ height: '100dvh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Loading...</span>
        </div>
    );

    if (!location) return (
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

    const hasRooms = Object.keys(roomsByFloor).length > 0;

    return (
        <div style={{ height: '100dvh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: 'var(--bg-primary)', paddingBottom: 100 }}>

            <LocationHero location={location} onBack={() => router.back()} />

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
                            onRoomClick={f => router.push(`/?selectedRoomId=${f.properties.poiId}`)}
                            roomNameMap={roomNameMap}
                        />
                    ))}
                </div>
            )}

            {QR_LOCATION_IDS.has(location.id) && (
                <LocationShareCard location={location} pageUrl={pageUrl} />
            )}

            <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                    onClick={() => {
                        const coords = location.coordinates;
                        router.push(`/?navTo=${location.id}&lng=${coords[0]}&lat=${coords[1]}`);
                    }}
                    style={{
                        width: '100%', height: 52, background: '#7C3AED',
                        color: '#fff', fontWeight: 700, fontSize: 15,
                        border: 'none', borderRadius: 14, cursor: 'pointer', letterSpacing: '0.01em',
                    }}
                >
                    Navigate to Building
                </button>
                <button
                    onClick={() => router.push('/')}
                    style={{
                        width: '100%', height: 52, background: 'transparent',
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
