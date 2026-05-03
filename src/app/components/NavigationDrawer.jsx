'use client';
import { useState, useMemo, useEffect } from 'react';
import {
    Box, Drawer, TextField, Typography, Stack,
    IconButton, List, ListItem, ListItemText,
} from '@mui/material';
import CloseIcon            from '@mui/icons-material/Close';
import MeetingRoomIcon      from '@mui/icons-material/MeetingRoom';
import NavigationIcon       from '@mui/icons-material/Navigation';
import MyLocationIcon       from '@mui/icons-material/MyLocation';
import SwapVertIcon         from '@mui/icons-material/SwapVert';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import FmdGoodIcon          from '@mui/icons-material/FmdGood';

const TEAL = '#1BA39C';

export default function NavigationDrawer({
    open, onClose,
    rooms, locations, gpsLocation,
    pointA, onSetPointA,
    pointB, onSetPointB,
    onPickFromMap,  // (field: 'A'|'B') => void
    onNavigate,     // (pointA, pointB) => void
}) {
    const [activeField, setActiveField] = useState('B');
    const [query, setQuery] = useState('');

    // When the drawer opens, focus destination field if A is already set
    useEffect(() => {
        if (!open) return;
        setActiveField(pointA ? 'B' : 'A');
        setQuery('');
    }, [open]);

    // Auto-fill Point A with GPS on open when nothing is set
    useEffect(() => {
        if (open && !pointA && gpsLocation) {
            onSetPointA({ type: 'gps', label: 'My Location', coords: [gpsLocation.lng, gpsLocation.lat] });
        }
    }, [open]);

    const roomIndex = useMemo(() => {
        if (!rooms?.features) return [];
        return rooms.features.map(f => {
            const p = f.properties;
            return {
                key:     `r-${p.poiId}`,
                type:    'room',
                label:   p.name || p.roomCode || '',
                sub:     `${p.buildingName ?? ''}${p.floorName ? ` · Floor ${p.floorName}` : ''}`,
                feature: f,
            };
        });
    }, [rooms]);

    const locationIndex = useMemo(() =>
        (Array.isArray(locations) ? locations : []).map(loc => ({
            key:   `l-${loc.id}`,
            type:  'location',
            label: loc.name || loc.id || '',
            sub:   loc.id || '',
            loc,
        }))
    , [locations]);

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        const matchedRooms = roomIndex
            .filter(r =>
                r.label.toLowerCase().includes(q) ||
                r.feature?.properties?.roomCode?.toLowerCase().includes(q) ||
                r.feature?.properties?.buildingName?.toLowerCase().includes(q)
            )
            .sort((a, b) => {
                const bldA = (a.feature?.properties?.buildingName ?? '').toLowerCase();
                const bldB = (b.feature?.properties?.buildingName ?? '').toLowerCase();
                if (bldA !== bldB) return bldA.localeCompare(bldB);
                const flA = (a.feature?.properties?.floorName ?? '');
                const flB = (b.feature?.properties?.floorName ?? '');
                if (flA !== flB) return flA.localeCompare(flB);
                return (a.label).localeCompare(b.label);
            })
            .slice(0, 50);
        const matchedLocs = locationIndex.filter(l =>
            l.label.toLowerCase().includes(q) || l.sub.toLowerCase().includes(q)
        ).slice(0, 8);
        return [...matchedRooms, ...matchedLocs];
    }, [roomIndex, locationIndex, query]);

    const handleSelect = (item) => {
        const point = item.type === 'room'
            ? { type: 'room',     label: item.label, feature: item.feature }
            : { type: 'location', label: item.label, loc: item.loc };
        if (activeField === 'A') {
            onSetPointA(point);
            setActiveField('B');
        } else {
            onSetPointB(point);
        }
        setQuery('');
    };

    const handleSwap = () => {
        const tmp = pointA;
        onSetPointA(pointB ?? null);
        onSetPointB(tmp ?? null);
    };

    const canNavigate = !!(pointA && pointB);

    const fieldBox = (field, point, icon, placeholder, accentColor) => (
        <Box
            onClick={() => { setActiveField(field); setQuery(''); }}
            sx={{
                flex: 1,
                display: 'flex', alignItems: 'center', gap: 1,
                px: 1.5, py: 1.25,
                borderRadius: '12px',
                bgcolor: activeField === field ? '#f0f9ff' : '#f8fafc',
                border: `1.5px solid ${activeField === field ? '#0ea5e9' : '#e2e8f0'}`,
                cursor: 'pointer',
                minHeight: 48,
                transition: 'all 0.15s',
            }}
        >
            {icon}
            <Typography sx={{
                flex: 1, fontSize: 14,
                fontWeight: point ? 600 : 400,
                color: point ? '#0f172a' : '#94a3b8',
            }}>
                {point ? point.label : placeholder}
            </Typography>
            {point && (
                <IconButton
                    size="small"
                    onClick={e => {
                        e.stopPropagation();
                        if (field === 'A') onSetPointA(null);
                        else onSetPointB(null);
                    }}
                    sx={{ p: 0.25, flexShrink: 0 }}
                >
                    <CloseIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                </IconButton>
            )}
        </Box>
    );

    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: '24px 24px 0 0',
                    height: '82dvh',
                    pb: 'env(safe-area-inset-bottom)',
                    display: 'flex', flexDirection: 'column',
                },
            }}
        >
            <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5, flexShrink: 0 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>Navigate</Typography>
                    <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Stack>

                {/* A → B selector */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexShrink: 0 }}>
                    {/* Timeline dots */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 1.75, gap: 0 }}>
                        <RadioButtonCheckedIcon sx={{ color: '#22c55e', fontSize: 18 }} />
                        <Box sx={{ width: 2, flex: 1, bgcolor: '#e2e8f0', my: 0.5, minHeight: 16 }} />
                        <FmdGoodIcon sx={{ color: '#ef4444', fontSize: 18 }} />
                    </Box>

                    {/* Input fields */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {fieldBox(
                            'A', pointA,
                            pointA?.type === 'gps'
                                ? <MyLocationIcon sx={{ fontSize: 16, color: '#22c55e', flexShrink: 0 }} />
                                : <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e', flexShrink: 0 }} />,
                            'Choose start point…',
                            '#22c55e',
                        )}
                        {fieldBox(
                            'B', pointB,
                            <FmdGoodIcon sx={{ fontSize: 16, color: '#ef4444', flexShrink: 0 }} />,
                            'Choose destination…',
                            '#ef4444',
                        )}
                    </Box>

                    {/* Swap button */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            onClick={handleSwap}
                            size="small"
                            sx={{ border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}
                        >
                            <SwapVertIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Box>
                </Box>

                {/* Search input */}
                <TextField
                    fullWidth
                    placeholder={activeField === 'A' ? 'Search for start point…' : 'Search for destination…'}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{ mb: 1.5, flexShrink: 0, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#f1f5f9' } }}
                />

                {/* Quick options for From field */}
                {activeField === 'A' && !query && (
                    <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexShrink: 0 }}>
                        {gpsLocation && (
                            <Box
                                onClick={() => {
                                    onSetPointA({ type: 'gps', label: 'My Location', coords: [gpsLocation.lng, gpsLocation.lat] });
                                    setActiveField('B');
                                    setQuery('');
                                }}
                                sx={{
                                    display: 'flex', alignItems: 'center', gap: 0.75,
                                    px: 1.5, py: 0.75, borderRadius: 99,
                                    bgcolor: '#f0fdf4', border: '1px solid #bbf7d0',
                                    cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#15803d',
                                    '&:hover': { bgcolor: '#dcfce7' }, userSelect: 'none',
                                }}
                            >
                                <MyLocationIcon sx={{ fontSize: 14 }} />
                                My Location
                            </Box>
                        )}
                        <Box
                            onClick={() => { onPickFromMap('A'); }}
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 0.75,
                                px: 1.5, py: 0.75, borderRadius: 99,
                                bgcolor: '#eff6ff', border: '1px solid #bfdbfe',
                                cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#1d4ed8',
                                '&:hover': { bgcolor: '#dbeafe' }, userSelect: 'none',
                            }}
                        >
                            📌 Tap map
                        </Box>
                    </Stack>
                )}

                {/* Results */}
                <List sx={{ flex: 1, overflowY: 'auto' }}>
                    {results.map(item => (
                        <ListItem
                            key={item.key}
                            onClick={() => handleSelect(item)}
                            sx={{
                                mb: 1, borderRadius: '14px',
                                border: `1px solid ${item.type === 'room' ? '#e0f2fe' : '#f1f5f9'}`,
                                bgcolor: item.type === 'room' ? '#f0f9ff' : '#f8fafc',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: item.type === 'room' ? '#e0f2fe' : '#f1f5f9' },
                            }}
                        >
                            <ListItemText
                                primary={<Typography sx={{ fontWeight: 700, fontSize: 14 }}>{item.label}</Typography>}
                                secondary={<Typography sx={{ fontSize: 12, color: '#94a3b8' }}>{item.sub}</Typography>}
                            />
                            {item.type === 'room'
                                ? <MeetingRoomIcon sx={{ color: '#0ea5e9', fontSize: 18, flexShrink: 0 }} />
                                : <NavigationIcon  sx={{ color: TEAL,      fontSize: 18, flexShrink: 0 }} />}
                        </ListItem>
                    ))}
                    {query.trim() && results.length === 0 && (
                        <Typography sx={{ textAlign: 'center', color: '#94a3b8', mt: 4, fontSize: 14 }}>
                            No results for &quot;{query}&quot;
                        </Typography>
                    )}
                </List>

                {/* Navigate button */}
                <Box
                    component="button"
                    disabled={!canNavigate}
                    onClick={() => canNavigate && onNavigate(pointA, pointB)}
                    sx={{
                        mt: 1.5, flexShrink: 0,
                        width: '100%', py: 1.75, borderRadius: '14px', border: 'none',
                        background: canNavigate
                            ? 'linear-gradient(135deg, #1BA39C 0%, #0e6d68 100%)'
                            : '#e2e8f0',
                        color: canNavigate ? '#fff' : '#94a3b8',
                        fontWeight: 800, fontSize: 15,
                        cursor: canNavigate ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                        boxShadow: canNavigate ? '0 4px 20px rgba(27,163,156,0.35)' : 'none',
                    }}
                >
                    {canNavigate ? '🧭  Start Navigation' : 'Select start & destination'}
                </Box>
            </Box>
        </Drawer>
    );
}
