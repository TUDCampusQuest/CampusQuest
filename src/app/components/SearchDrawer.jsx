'use client';
import { useMemo, useState } from 'react';
import {
    Box, Chip, Drawer, List, ListItem, ListItemText,
    TextField, Typography, Stack, IconButton,
} from '@mui/material';
import NavigationIcon  from '@mui/icons-material/Navigation';
import CloseIcon       from '@mui/icons-material/Close';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

const FILTER_TABS = ['All', 'Lectures', 'Labs', 'Toilets', 'Stairs'];

function getRoomCategory(props) {
    const t = (props.typeName || '').toLowerCase().trim();
    const k = (props.kind    || '').toLowerCase().trim();
    if (k === 'stairs' || t === 'stairs') return 'Stairs';
    if (t === 'lecture') return 'Lectures';
    if (t === 'computer lab' || t === 'laboratory') return 'Labs';
    if (t.startsWith('wc')) return 'Toilets';
    return 'All';
}

export default function SearchDrawer({
    open, onClose, query, onQueryChange,
    results, onSelect,
    rooms, onRoomSelect,
}) {
    const [activeFilter, setActiveFilter] = useState('All');

    const roomIndex = useMemo(() => {
        if (!rooms?.features) return [];
        return rooms.features.map(f => {
            const p = f.properties;
            return {
                poiId:        p.poiId,
                roomCode:     p.roomCode     || '',
                name:         p.name         || '',
                buildingName: p.buildingName || '',
                floorName:    p.floorName    || '',
                centerLng:    p.centerLng,
                centerLat:    p.centerLat,
                floorId:      p.floorId,
                typeName:     p.typeName     || '',
                category:     getRoomCategory(p),
            };
        });
    }, [rooms]);

    const filteredRooms = useMemo(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        return roomIndex.filter(r => {
            const matchesQuery =
                r.roomCode.toLowerCase().includes(q) ||
                r.name.toLowerCase().includes(q)     ||
                r.buildingName.toLowerCase().includes(q);
            const matchesFilter = activeFilter === 'All' || r.category === activeFilter;
            return matchesQuery && matchesFilter;
        });
    }, [roomIndex, query, activeFilter]);

    const handleRoomClick = (room) => {
        const feature = rooms?.features?.find(f => f.properties.poiId === room.poiId);
        if (feature && onRoomSelect) {
            onRoomSelect(feature);
            onClose();
        }
    };

    const showSectionLabels = results.length > 0 && filteredRooms.length > 0;
    const showFilterTabs    = roomIndex.length > 0;

    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            PaperProps={{ sx: {
                borderRadius: '24px 24px 0 0',
                height: '80dvh',
                pb: 'env(safe-area-inset-bottom)',
            }}}
        >
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>

                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>Locations</Typography>
                    <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Stack>

                {/* Search input */}
                <TextField
                    fullWidth autoFocus
                    placeholder="Search by name or room code..."
                    value={query}
                    onChange={e => onQueryChange(e.target.value)}
                    variant="outlined"
                    sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#f1f5f9' } }}
                />

                {/* Indoor filter tabs */}
                {showFilterTabs && (
                    <Stack direction="row" spacing={1} sx={{ mb: 2, overflowX: 'auto', flexShrink: 0, pb: 0.5 }}>
                        {FILTER_TABS.map(tab => (
                            <Chip
                                key={tab}
                                label={tab}
                                size="small"
                                onClick={() => setActiveFilter(tab)}
                                color={activeFilter === tab ? 'primary' : 'default'}
                                variant={activeFilter === tab ? 'filled' : 'outlined'}
                                sx={{ flexShrink: 0, cursor: 'pointer', fontWeight: 600 }}
                            />
                        ))}
                    </Stack>
                )}

                {/* Results list */}
                <List sx={{ flex: 1, overflowY: 'auto' }}>

                    {/* ── Outdoor / building results ── */}
                    {results.length > 0 && (
                        <>
                            {showSectionLabels && (
                                <Typography sx={{
                                    fontSize: 10, fontWeight: 700, color: '#94a3b8',
                                    letterSpacing: '0.09em', textTransform: 'uppercase',
                                    mb: 1, px: 1,
                                }}>
                                    Buildings &amp; Locations
                                </Typography>
                            )}
                            {results.map(loc => (
                                <ListItem
                                    key={loc.id}
                                    onClick={() => onSelect(loc)}
                                    sx={{
                                        mb: 1.5, borderRadius: '16px',
                                        border: '1px solid #f1f5f9',
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: '#f8fafc' },
                                    }}
                                >
                                    <ListItemText
                                        primary={<Typography sx={{ fontWeight: 700 }}>{loc.name}</Typography>}
                                        secondary={loc.id}
                                    />
                                    <NavigationIcon sx={{ color: '#1BA39C' }} />
                                </ListItem>
                            ))}
                        </>
                    )}

                    {/* ── Indoor room results ── */}
                    {filteredRooms.length > 0 && (
                        <>
                            <Typography sx={{
                                fontSize: 10, fontWeight: 700, color: '#94a3b8',
                                letterSpacing: '0.09em', textTransform: 'uppercase',
                                mb: 1, px: 1, mt: showSectionLabels ? 2 : 0,
                            }}>
                                Indoor Rooms
                            </Typography>
                            {filteredRooms.map(room => {
                                const hasDistinctName = room.name && room.name !== room.roomCode;
                                const primary   = hasDistinctName ? room.name : room.roomCode;
                                const secondary = (
                                    <span>
                                        {hasDistinctName && (
                                            <span style={{ color: '#64748b', marginRight: 6 }}>{room.roomCode}</span>
                                        )}
                                        {room.buildingName}
                                        {room.floorName ? (
                                            <span style={{ color: '#94a3b8' }}> · Floor {room.floorName}</span>
                                        ) : null}
                                    </span>
                                );
                                return (
                                    <ListItem
                                        key={room.poiId}
                                        onClick={() => handleRoomClick(room)}
                                        sx={{
                                            mb: 1.5, borderRadius: '16px',
                                            border: '1px solid #e0f2fe',
                                            bgcolor: '#f0f9ff',
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: '#e0f2fe' },
                                        }}
                                    >
                                        <ListItemText
                                            primary={<Typography sx={{ fontWeight: 700 }}>{primary}</Typography>}
                                            secondary={secondary}
                                        />
                                        <MeetingRoomIcon sx={{ color: '#0ea5e9', fontSize: 20, flexShrink: 0 }} />
                                    </ListItem>
                                );
                            })}
                        </>
                    )}

                    {/* Empty state */}
                    {query.trim() && results.length === 0 && filteredRooms.length === 0 && (
                        <Typography sx={{ textAlign: 'center', color: '#94a3b8', mt: 4, fontSize: 14 }}>
                            No results for &quot;{query}&quot;
                        </Typography>
                    )}
                </List>
            </Box>
        </Drawer>
    );
}
