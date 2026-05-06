'use client';
// Full-page building detail view showing rooms by floor and a navigate button.
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { locations } from "../../data/locations";
import useIndoorData from "../../hooks/useIndoorData";
import { getRoomDisplayName } from "../../lib/roomUtils";
import LocationHero from "../../components/LocationHero";
import FloorAccordion from "../../components/FloorAccordion";
import styles from "../../styles/locationDetails.module.css";

const HIDDEN_TYPES = new Set(['circulation', 'plant', 'storage']);
const HIDDEN_KINDS = new Set(['circulation_room']);

export default function LocationDetailsClient({ id }) {
    const router = useRouter();
    const [location,  setLocation]  = useState(null);
    const [loading,   setLoading]   = useState(true);
    const [openFloor, setOpenFloor] = useState('G');

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
        <div className={styles.loadingScreen}>
            <span className={styles.loadingText}>Loading...</span>
        </div>
    );

    if (!location) return (
        <div className={styles.notFoundScreen}>
            <span className={styles.notFoundTitle}>Location Not Found</span>
            <button onClick={() => router.push('/')} className={styles.notFoundBtn}>Back to Map</button>
        </div>
    );

    const hasRooms = Object.keys(roomsByFloor).length > 0;

    return (
        <div className={styles.page}>

            <LocationHero location={location} onBack={() => router.back()} />

            {hasRooms && (
                <div className={styles.roomsSection}>
                    <div className={styles.roomsLabel}>Rooms in this building</div>
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

            <div className={styles.actions}>
                <button
                    onClick={() => {
                        const coords = location.coordinates;
                        router.push(`/?navTo=${location.id}&lng=${coords[0]}&lat=${coords[1]}`);
                    }}
                    className={styles.btnNavigate}
                >
                    Navigate to Building
                </button>
                <button onClick={() => router.push('/')} className={styles.btnBack}>
                    Back to Map
                </button>
            </div>
        </div>
    );
}
