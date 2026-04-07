'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Box, Stack, Typography, Chip, IconButton, Divider, Tooltip,
} from '@mui/material';
import CloseIcon        from '@mui/icons-material/Close';
import NavigationIcon   from '@mui/icons-material/Navigation';
import MapIcon          from '@mui/icons-material/Map';
import ShareIcon        from '@mui/icons-material/Share';
import OpenInNewIcon    from '@mui/icons-material/OpenInNew';
import MeetingRoomIcon  from '@mui/icons-material/MeetingRoom';
import CheckIcon        from '@mui/icons-material/Check';

// ── helpers ───────────────────────────────────────────────────────────────────
function useIsDesktop() {
    const [desktop, setDesktop] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia('(min-width: 768px)');
        setDesktop(mq.matches);
        const handler = e => setDesktop(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);
    return desktop;
}

// ── Action button ─────────────────────────────────────────────────────────────
function ActionBtn({ icon, label, onClick, primary, disabled, success }) {
    return (
        <Box
            onClick={disabled ? undefined : onClick}
            sx={{
                flex: 1,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '5px', py: 1.5, px: 0.5,
                borderRadius: '14px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                border: primary ? 'none' : '1.5px solid #e2e8f0',
                background: success
                    ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                    : primary
                        ? 'linear-gradient(135deg,#1BA39C 0%,#0e6d68 100%)'
                        : '#f8fafc',
                boxShadow: primary && !success ? '0 4px 14px rgba(27,163,156,0.35)' : 'none',
                opacity: disabled ? 0.45 : 1,
                transition: 'all 0.18s',
                '&:hover': disabled ? {} : {
                    transform: 'translateY(-2px)',
                    boxShadow: primary
                        ? '0 8px 20px rgba(27,163,156,0.45)'
                        : '0 4px 12px rgba(0,0,0,0.08)',
                },
                userSelect: 'none',
            }}
        >
            <Box sx={{ color: primary || success ? '#fff' : '#475569', display: 'flex', fontSize: 20 }}>
                {success ? <CheckIcon fontSize="small" /> : icon}
            </Box>
            <Typography sx={{
                fontSize: 11, fontWeight: 700,
                color: primary || success ? '#fff' : '#475569',
                letterSpacing: '0.01em', lineHeight: 1,
            }}>
                {success ? 'Copied!' : label}
            </Typography>
        </Box>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LocationSheet({ location, onClose, onNavigate }) {
    const router    = useRouter();
    const isDesktop = useIsDesktop();
    const [shared, setShared] = useState(false);
    const dragRef   = useRef(null);

    // Reset shared state when location changes
    useEffect(() => { setShared(false); }, [location?.id]);

    if (!location) return null;

    const handleShare = async () => {
        const url  = `${window.location.origin}/location/${location.id}`;
        const text = `${location.name} — Campus Quest, TU Dublin`;
        try {
            if (navigator.share) {
                await navigator.share({ title: text, url });
            } else {
                await navigator.clipboard.writeText(url);
                setShared(true);
                setTimeout(() => setShared(false), 2000);
            }
        } catch { /* user cancelled */ }
    };

    const handleViewDetails = () => {
        router.push(`/location/${location.id}`);
        onClose();
    };

    const handleNavigate = () => {
        onNavigate(location);
        onClose();
    };

    // ── DESKTOP — side panel ──────────────────────────────────────────────────
    if (isDesktop) {
        return (
            <AnimatePresence>
                {location && (
                    <>
                        {/* Backdrop — subtle, doesn't cover map controls */}
                        <motion.div
                            key="desktop-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={onClose}
                            style={{
                                position: 'absolute', inset: 0, zIndex: 18,
                                background: 'rgba(15,23,42,0.15)',
                                backdropFilter: 'blur(1px)',
                            }}
                        />
                        <motion.div
                            key="desktop-panel"
                            initial={{ x: 380, opacity: 0 }}
                            animate={{ x: 0,   opacity: 1 }}
                            exit={{   x: 380, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                            style={{
                                position: 'absolute', top: 0, right: 0, bottom: 0,
                                width: 380, zIndex: 19,
                                background: '#fff',
                                boxShadow: '-8px 0 40px rgba(0,0,0,0.14)',
                                display: 'flex', flexDirection: 'column',
                                overflow: 'hidden',
                            }}
                        >
                            <PanelContent
                                location={location}
                                onClose={onClose}
                                onNavigate={handleNavigate}
                                onShare={handleShare}
                                onViewDetails={handleViewDetails}
                                shared={shared}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        );
    }

    // ── MOBILE — bottom sheet ─────────────────────────────────────────────────
    return (
        <AnimatePresence>
            {location && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="mobile-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'absolute', inset: 0, zIndex: 18,
                            background: 'rgba(15,23,42,0.3)',
                        }}
                    />

                    <motion.div
                        key="mobile-sheet"
                        ref={dragRef}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0.05, bottom: 0.4 }}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 80 || info.velocity.y > 400) onClose();
                        }}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 340, damping: 34 }}
                        style={{
                            position: 'absolute', left: 0, right: 0, bottom: 0,
                            zIndex: 19,
                            background: '#fff',
                            borderRadius: '24px 24px 0 0',
                            boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
                            maxHeight: '88dvh',
                            display: 'flex', flexDirection: 'column',
                            overflow: 'hidden',
                            touchAction: 'none',
                        }}
                    >
                        {/* Drag handle */}
                        <Box sx={{
                            pt: 1.5, pb: 0.5,
                            display: 'flex', justifyContent: 'center', flexShrink: 0,
                        }}>
                            <Box sx={{ width: 40, height: 4, borderRadius: 99, bgcolor: '#e2e8f0' }} />
                        </Box>

                        <PanelContent
                            location={location}
                            onClose={onClose}
                            onNavigate={handleNavigate}
                            onShare={handleShare}
                            onViewDetails={handleViewDetails}
                            shared={shared}
                            isMobile
                        />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ── Shared panel content ──────────────────────────────────────────────────────
function PanelContent({ location, onClose, onNavigate, onShare, onViewDetails, shared, isMobile }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

            {/* Hero image */}
            <Box sx={{
                position: 'relative', flexShrink: 0,
                height: isMobile ? 200 : 240,
                bgcolor: '#e2e8f0', overflow: 'hidden',
            }}>
                {location.image && (
                    <Box
                        component="img"
                        src={location.image}
                        alt={location.name}
                        sx={{
                            width: '100%', height: '100%',
                            objectFit: 'cover', objectPosition: 'center',
                            display: 'block',
                        }}
                        onError={e => { e.target.style.display = 'none'; }}
                    />
                )}
                {/* Gradient overlay for close button legibility */}
                <Box sx={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 50%)',
                }} />

                {/* Close button */}
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        position: 'absolute', top: 10, right: 10,
                        bgcolor: 'rgba(0,0,0,0.45)', color: '#fff',
                        backdropFilter: 'blur(6px)',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.65)' },
                        width: 34, height: 34,
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>

                {/* ID chip on image */}
                <Chip
                    label={location.id}
                    size="small"
                    sx={{
                        position: 'absolute', bottom: 12, left: 14,
                        bgcolor: '#1BA39C', color: '#fff',
                        fontWeight: 800, fontSize: 11,
                        letterSpacing: '0.06em',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                    }}
                />
            </Box>

            {/* Scrollable body */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, pt: 2, pb: 1 }}>

                {/* Name */}
                <Typography sx={{
                    fontWeight: 900, fontSize: '1.25rem',
                    color: '#0f172a', lineHeight: 1.2, mb: 0.75,
                }}>
                    {location.name}
                </Typography>

                {/* Description */}
                <Typography sx={{
                    fontSize: 14, color: '#475569', lineHeight: 1.7, mb: 2,
                }}>
                    {location.description}
                </Typography>

                <Divider sx={{ mb: 2 }} />

                {/* Floors info */}
                {location.floors && location.floors.length > 0 && (
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
                        <Box sx={{
                            width: 34, height: 34, borderRadius: '10px',
                            bgcolor: '#f0fdfa', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            <MeetingRoomIcon sx={{ fontSize: 18, color: '#1BA39C' }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                Floors
                            </Typography>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                                {location.floors.join(', ')}
                            </Typography>
                        </Box>
                    </Stack>
                )}

                {/* Indoor map placeholder — staff note */}
                <Box sx={{
                    p: 1.75, borderRadius: '12px',
                    bgcolor: '#fffbeb', border: '1px dashed #fde68a',
                    display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.5,
                }}>
                    <MapIcon sx={{ fontSize: 18, color: '#f59e0b', flexShrink: 0 }} />
                    <Box>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>
                            Indoor Map
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: '#b45309', lineHeight: 1.4 }}>
                            Floor plans coming soon
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Action buttons — sticky at bottom */}
            <Box sx={{
                flexShrink: 0, px: 2, pt: 1.5,
                pb: isMobile ? 'max(16px, env(safe-area-inset-bottom))' : '20px',
                borderTop: '1px solid #f1f5f9',
                bgcolor: '#fff',
            }}>
                <Stack direction="row" spacing={1}>
                    <ActionBtn
                        icon={<NavigationIcon fontSize="small" />}
                        label="Navigate"
                        onClick={onNavigate}
                        primary
                    />
                    <ActionBtn
                        icon={<MapIcon fontSize="small" />}
                        label="Indoor"
                        onClick={() => {}} // placeholder
                        disabled
                    />
                    <ActionBtn
                        icon={<ShareIcon fontSize="small" />}
                        label="Share"
                        onClick={onShare}
                        success={shared}
                    />
                    <ActionBtn
                        icon={<OpenInNewIcon fontSize="small" />}
                        label="Details"
                        onClick={onViewDetails}
                    />
                </Stack>
            </Box>
        </Box>
    );
}