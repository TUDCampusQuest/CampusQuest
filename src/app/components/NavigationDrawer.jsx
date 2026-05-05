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
import { isWithinCampus }   from '../lib/campusBounds';

const TEAL = '#7C3AED';

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
    const [showOffCampusWarning, setShowOffCampusWarning] = useState(false);

    const gpsOnCampus = !!gpsLocation && isWithinCampus(gpsLocation.lng, gpsLocation.lat);

    // When the drawer opens, focus destination field if A is already set
    useEffect(() => {
        if (!open) return;
        setActiveField(pointA ? 'B' : 'A');
        setQuery('');
    }, [open]);

    // Do NOT auto-fill GPS — let the user explicitly choose My Location or a room

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
                bgcolor: activeField === field ? 'var(--bg-surface)' : 'var(--btn-ghost-bg)',
                border: `1.5px solid ${activeField === field ? '#7C3AED' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                minHeight: 48,
                transition: 'all 0.15s',
            }}
        >
            {icon}
            <Typography sx={{
                flex: 1, fontSize: 14,
                fontWeight: point ? 600 : 400,
                color: point ? 'var(--text-primary)' : 'var(--text-muted)',
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
                    <CloseIcon sx={{ fontSize: 14, color: 'var(--text-secondary)' }} />
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
                    bgcolor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    borderTop: '1px solid var(--border-card)',
                },
            }}
        >
            <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5, flexShrink: 0 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>Navigate</Typography>
                    <IconButton onClick={onClose} sx={{ color: 'var(--text-secondary)' }}><CloseIcon /></IconButton>
                </Stack>

                {/* A → B selector */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexShrink: 0 }}>
                    {/* Timeline dots */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 1.75, gap: 0 }}>
                        <RadioButtonCheckedIcon sx={{ color: '#22c55e', fontSize: 18 }} />
                        <Box sx={{ width: 2, flex: 1, bgcolor: 'var(--border-card)', my: 0.5, minHeight: 16 }} />
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
                            sx={{ border: '1px solid var(--border-card)', bgcolor: 'var(--btn-ghost-bg)' }}
                        >
                            <SwapVertIcon sx={{ fontSize: 18, color: 'var(--text-secondary)' }} />
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
                    sx={{ mb: 1.5, flexShrink: 0, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'var(--bg-input)', color: 'var(--text-primary)', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border-subtle)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border-card)' }, '& input': { color: 'var(--text-primary)' }, '& input::placeholder': { color: 'var(--text-muted)', opacity: 1 } } }}
                />

                {/* Quick options for From field */}
                {activeField === 'A' && !query && (
                    <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexShrink: 0, flexWrap: 'wrap' }}>
                        {gpsLocation && (
                            <Box
                                onClick={() => {
                                    if (!gpsOnCampus) {
                                        setShowOffCampusWarning(true);
                                        setTimeout(() => setShowOffCampusWarning(false), 4000);
                                        return;
                                    }
                                    onSetPointA({ type: 'gps', label: 'My Location', coords: [gpsLocation.lng, gpsLocation.lat] });
                                    setActiveField('B');
                                    setQuery('');
                                }}
                                title={gpsOnCampus ? 'Use my GPS as start' : 'Only available on campus'}
                                sx={{
                                    display: 'flex', alignItems: 'center', gap: 0.75,
                                    px: 1.5, py: 0.75, borderRadius: 99,
                                    bgcolor: gpsOnCampus ? 'rgba(34,197,94,0.1)'   : 'rgba(148,163,184,0.08)',
                                    border:   gpsOnCampus ? '1px solid rgba(34,197,94,0.25)' : '1px dashed rgba(148,163,184,0.35)',
                                    cursor: gpsOnCampus ? 'pointer' : 'not-allowed',
                                    opacity: gpsOnCampus ? 1 : 0.55,
                                    fontSize: 13, fontWeight: 700,
                                    color: gpsOnCampus ? '#22c55e' : 'var(--text-muted)',
                                    '&:hover': { bgcolor: gpsOnCampus ? 'rgba(34,197,94,0.18)' : 'rgba(148,163,184,0.08)' },
                                    userSelect: 'none',
                                }}
                            >
                                <MyLocationIcon sx={{ fontSize: 14 }} />
                                My Location
                            </Box>
                        )}
                        {onPickFromMap && (
                            <Box
                                onClick={() => { onPickFromMap('A'); }}
                                sx={{
                                    display: 'flex', alignItems: 'center', gap: 0.75,
                                    px: 1.5, py: 0.75, borderRadius: 99,
                                    bgcolor: 'var(--btn-ghost-bg)', border: '1px solid var(--border-subtle)',
                                    cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)',
                                    '&:hover': { bgcolor: 'var(--loc-item-hover)' }, userSelect: 'none',
                                }}
                            >
                                📌 Tap map
                            </Box>
                        )}
                        {showOffCampusWarning && (
                            <Box
                                sx={{
                                    width: '100%', mt: 1, px: 1.5, py: 1, borderRadius: 1.5,
                                    bgcolor: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.35)',
                                    color: '#eab308', fontSize: 12, fontWeight: 600,
                                }}
                            >
                                ⚠️ You&apos;re currently off-campus. Please pick a building as your start point.
                            </Box>
                        )}
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
                                border: `1px solid ${item.type === 'room' ? 'var(--room-item-border)' : 'var(--loc-item-border)'}`,
                                bgcolor: item.type === 'room' ? 'var(--room-item-bg)' : 'var(--loc-item-bg)',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: item.type === 'room' ? 'var(--room-item-hover)' : 'var(--loc-item-hover)' },
                            }}
                        >
                            <ListItemText
                                primary={<Typography sx={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{item.label}</Typography>}
                                secondary={<Typography sx={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.sub}</Typography>}
                            />
                            {item.type === 'room'
                                ? <MeetingRoomIcon sx={{ color: '#0ea5e9', fontSize: 18, flexShrink: 0 }} />
                                : <NavigationIcon  sx={{ color: TEAL,      fontSize: 18, flexShrink: 0 }} />}
                        </ListItem>
                    ))}
                    {query.trim() && results.length === 0 && (
                        <Typography sx={{ textAlign: 'center', color: 'var(--text-secondary)', mt: 4, fontSize: 14 }}>
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
                            ? 'linear-gradient(135deg, #7C3AED 0%, #5b21b6 100%)'
                            : 'var(--btn-ghost-bg)',
                        color: canNavigate ? '#fff' : 'var(--text-muted)',
                        fontWeight: 800, fontSize: 15,
                        cursor: canNavigate ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                        boxShadow: canNavigate ? '0 4px 20px rgba(124,58,237,0.35)' : 'none',
                    }}
                >
                    {canNavigate ? '🧭  Start Navigation' : 'Select start & destination'}
                </Box>
            </Box>
        </Drawer>
    );
}
