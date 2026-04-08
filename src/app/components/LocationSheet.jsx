'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence }      from 'framer-motion';
import { useRouter }                    from 'next/navigation';
import { Box }                          from '@mui/material';
import LocationSheetContent             from './LocationSheetContent';

// ── useIsDesktop ──────────────────────────────────────────────────────────────
function useIsDesktop() {
    const [desktop, setDesktop] = useState(false);
    useEffect(() => {
        const mq      = window.matchMedia('(min-width: 768px)');
        setDesktop(mq.matches);
        const handler = e => setDesktop(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);
    return desktop;
}

// ── LocationSheet ─────────────────────────────────────────────────────────────
// Renders a slide-up bottom sheet on mobile, a slide-in side panel on desktop.
// Props:
//   location  {object|null} — selected campus location; null hides the sheet
//   onClose   {fn}
//   onNavigate {fn}         — called with the location when Navigate is tapped
export default function LocationSheet({ location, onClose, onNavigate }) {
    const router    = useRouter();
    const isDesktop = useIsDesktop();
    const dragRef   = useRef(null);
    const [shared, setShared] = useState(false);

    // Reset share state whenever a different location is shown
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

    const handleViewDetails = () => { router.push(`/location/${location.id}`); onClose(); };
    const handleNavigate    = () => { onNavigate(location); onClose(); };

    // Shared content props
    const contentProps = { location, onClose, onNavigate: handleNavigate, onShare: handleShare, onViewDetails: handleViewDetails, shared };

    // ── DESKTOP — right side panel ────────────────────────────────────────────
    if (isDesktop) {
        return (
            <AnimatePresence>
                {location && (
                    <>
                        <motion.div
                            key="desktop-backdrop"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={onClose}
                            style={{ position: 'absolute', inset: 0, zIndex: 18, background: 'rgba(15,23,42,0.15)', backdropFilter: 'blur(1px)' }}
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
                                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                            }}
                        >
                            <LocationSheetContent {...contentProps} />
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
                    <motion.div
                        key="mobile-backdrop"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ position: 'absolute', inset: 0, zIndex: 18, background: 'rgba(15,23,42,0.3)' }}
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
                        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                        style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            zIndex: 19, background: '#fff',
                            borderRadius: '24px 24px 0 0',
                            boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
                            maxHeight: '88dvh',
                            display: 'flex', flexDirection: 'column',
                            overflow: 'hidden', touchAction: 'none',
                        }}
                    >
                        {/* Drag handle */}
                        <Box sx={{ pt: 1.5, pb: 0.5, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                            <Box sx={{ width: 40, height: 4, borderRadius: 99, bgcolor: '#e2e8f0' }} />
                        </Box>

                        <LocationSheetContent {...contentProps} isMobile />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}