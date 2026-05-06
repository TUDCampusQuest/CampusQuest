'use client';
// Bottom-sheet search for buildings and indoor rooms, with category filter tabs and fly-to on room select.

import { useMemo, useState } from 'react';
import {
    Box, Drawer, List, ListItem, ListItemText,
    TextField, Typography, Stack, IconButton,
} from '@mui/material';
import NavigationIcon from '@mui/icons-material/Navigation';
import CloseIcon from '@mui/icons-material/Close';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { getRoomDisplayName } from '../lib/roomUtils';
import styles from '../styles/SearchDrawer.module.css';

const FILTER_TABS = ['All', 'Lectures', 'Labs', 'Toilets', 'Stairs'];

function getRoomCategory(props) {
    const type = (props.typeName || '').toLowerCase().trim();
    const kind = (props.kind || '').toLowerCase().trim();

    if (kind === 'stairs' || type.includes('stair')) return 'Stairs';
    if (type.includes('lecture') || type.includes('theatre') || type.includes('auditorium')) return 'Lectures';
    if (type.includes('computer') || type.includes('lab') || type.includes('workshop') || type.includes('studio')) return 'Labs';
    if (type.startsWith('wc') || type.includes('toilet') || type.includes('bathroom') || type.includes('washroom')) return 'Toilets';

    return 'All';
}

export default function SearchDrawer({
    open,
    onClose,
    query,
    onQueryChange,
    results,
    onSelect,
    rooms,
    onRoomSelect,
    roomNameMap,
}) {
    const [activeFilter, setActiveFilter] = useState('All');

    const roomIndex = useMemo(() => {
        if (!rooms?.features) return [];
        return rooms.features.map(f => {
            const p = f.properties;
            const displayName = getRoomDisplayName(p.roomCode, roomNameMap) || p.name || p.roomCode || '';
            return {
                poiId:        p.poiId,
                roomCode:     p.roomCode     || '',
                name:         p.name         || '',
                displayName,
                buildingName: p.buildingName || '',
                floorName:    p.floorName    || '',
                centerLng:    p.centerLng,
                centerLat:    p.centerLat,
                floorId:      p.floorId,
                typeName:     p.typeName     || '',
                category:     getRoomCategory(p),
            };
        });
    }, [rooms, roomNameMap]);

    const filteredRooms = useMemo(() => {
        const q = query.toLowerCase().trim();
        const hasQuery = q.length > 0;
        const hasFilter = activeFilter !== 'All';

        if (!hasQuery && !hasFilter) return [];

        return roomIndex.filter(r => {
            const matchesQuery = !hasQuery || (
                r.roomCode.toLowerCase().includes(q) ||
                r.displayName.toLowerCase().includes(q) ||
                r.name.toLowerCase().includes(q) ||
                r.buildingName.toLowerCase().includes(q)
            );
            const matchesFilter = !hasFilter || r.category === activeFilter;
            return matchesQuery && matchesFilter;
        });
    }, [roomIndex, query, activeFilter]);

    const handleRoomClick = (room) => {
        const feature = rooms?.features?.find(f => f.properties.poiId === room.poiId);
        if (!feature) return;
        onClose();
        onRoomSelect?.(feature);
    };

    const showBuildings = activeFilter === 'All' && results.length > 0;
    const showSectionLabels = showBuildings && filteredRooms.length > 0;
    const showFilterTabs = roomIndex.length > 0;

    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: '24px 24px 0 0',
                    height: '80dvh',
                    pb: 'env(safe-area-inset-bottom)',
                    bgcolor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    borderTop: '1px solid var(--border-color)',
                },
            }}
        >
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                        Locations
                    </Typography>
                    <IconButton onClick={onClose} sx={{ color: 'var(--text-secondary)' }}>
                        <CloseIcon />
                    </IconButton>
                </Stack>

                <TextField
                    fullWidth
                    autoFocus
                    placeholder="Search by name or room code..."
                    value={query}
                    onChange={e => onQueryChange(e.target.value)}
                    variant="outlined"
                    sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            bgcolor: 'var(--bg-card)',
                            color: 'var(--text-primary)',
                        },
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border-color)' },
                        '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--accent-purple)' },
                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--accent-purple)' },
                        '& input': { color: 'var(--text-primary)' },
                        '& input::placeholder': { color: 'var(--text-secondary)', opacity: 1 },
                    }}
                />

                {showFilterTabs && (
                    <Stack direction="row" spacing={1} sx={{ mb: 2, overflowX: 'auto', flexShrink: 0, pb: 0.5 }}>
                        {FILTER_TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveFilter(tab)}
                                className={styles.filterTab}
                                style={{
                                    background: activeFilter === tab ? 'var(--accent-purple)' : 'var(--bg-card)',
                                    color: activeFilter === tab ? '#fff' : 'var(--text-secondary)',
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </Stack>
                )}

                <List sx={{ flex: 1, overflowY: 'auto' }}>

                    {showBuildings && (
                        <>
                            {showSectionLabels && (
                                <Typography sx={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: 'var(--text-secondary)',
                                    letterSpacing: '0.09em',
                                    textTransform: 'uppercase',
                                    mb: 1,
                                    px: 1,
                                }}>
                                    Buildings &amp; Locations
                                </Typography>
                            )}
                            {results.map(loc => (
                                <ListItem
                                    key={loc.id}
                                    onClick={() => onSelect(loc)}
                                    sx={{
                                        mb: 1,
                                        borderRadius: '12px',
                                        borderBottom: '1px solid var(--border-color)',
                                        bgcolor: 'transparent',
                                        cursor: 'pointer',
                                        px: 1,
                                        '&:hover': { bgcolor: 'var(--bg-card)' },
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography sx={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                                                {loc.name}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography sx={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                                {loc.id}
                                            </Typography>
                                        }
                                    />
                                    <NavigationIcon sx={{ color: 'var(--accent-teal)', fontSize: 20 }} />
                                </ListItem>
                            ))}
                        </>
                    )}

                    {filteredRooms.length > 0 && (
                        <>
                            <Typography sx={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: 'var(--text-secondary)',
                                letterSpacing: '0.09em',
                                textTransform: 'uppercase',
                                mb: 1,
                                px: 1,
                                mt: showSectionLabels ? 2 : 0,
                            }}>
                                Indoor Rooms
                            </Typography>
                            {filteredRooms.map(room => {
                                const primary = room.displayName || room.roomCode;
                                const showCode = primary !== room.roomCode;
                                const secondary = (
                                    <span>
                                        {showCode && (
                                            <span style={{ color: 'var(--text-secondary)', marginRight: 6 }}>
                                                {room.roomCode}
                                            </span>
                                        )}
                                        {room.buildingName}
                                        {room.floorName && (
                                            <span style={{ color: 'var(--text-secondary)' }}> · Floor {room.floorName}</span>
                                        )}
                                    </span>
                                );
                                return (
                                    <ListItem
                                        key={room.poiId}
                                        onClick={() => handleRoomClick(room)}
                                        sx={{
                                            mb: 0,
                                            borderRadius: 0,
                                            borderBottom: '1px solid var(--border-color)',
                                            bgcolor: 'transparent',
                                            cursor: 'pointer',
                                            px: 1,
                                            '&:hover': { bgcolor: 'var(--bg-card)' },
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Typography sx={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                                                    {primary}
                                                </Typography>
                                            }
                                            secondary={secondary}
                                        />
                                        <MeetingRoomIcon sx={{ color: 'var(--accent-purple)', fontSize: 20, flexShrink: 0 }} />
                                    </ListItem>
                                );
                            })}
                        </>
                    )}

                    {(query.trim() || activeFilter !== 'All') && !showBuildings && filteredRooms.length === 0 && (
                        <Typography sx={{ textAlign: 'center', color: 'var(--text-secondary)', mt: 4, fontSize: 14 }}>
                            {query.trim()
                                ? `No results for "${query}"${activeFilter !== 'All' ? ` in ${activeFilter}` : ''}`
                                : `No ${activeFilter} rooms found`}
                        </Typography>
                    )}

                </List>
            </Box>
        </Drawer>
    );
}
