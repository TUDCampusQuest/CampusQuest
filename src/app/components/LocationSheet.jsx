'use client';
// Responsive location info sheet: side panel on desktop, draggable bottom sheet on mobile.
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import LocationSheetContent from './LocationSheetContent';
import styles from './LocationSheet.module.css';

const SPRING = { type: 'spring', stiffness: 300, damping: 35 };

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

export default function LocationSheet({ location, onClose, onNavigate, onSetAsStart }) {
    const router    = useRouter();
    const isDesktop = useIsDesktop();
    const dragRef   = useRef(null);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => { setExpanded(false); }, [location?.id]);

    if (!location) return null;

    const handleViewDetails = () => { router.push(`/location/${location.id}`); onClose(); };
    const handleNavigate    = () => { onNavigate(location); onClose(); };
    const handleSetAsStart  = () => { onSetAsStart?.(location); onClose(); };

    const contentProps = {
        location, onClose,
        onNavigate:    handleNavigate,
        onSetAsStart:  onSetAsStart ? handleSetAsStart : undefined,
        onViewDetails: handleViewDetails,
    };

    if (isDesktop) {
        return (
            <AnimatePresence>
                {location && (
                    <motion.div
                        key="desk-panel"
                        className={styles.desktopPanel}
                        initial={{ x: 380, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 380, opacity: 0 }}
                        transition={SPRING}
                    >
                        <LocationSheetContent {...contentProps} />
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

    return (
        <AnimatePresence>
            {location && (
                <motion.div
                    key="mob-sheet"
                    ref={dragRef}
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={{ top: 0.08, bottom: 0.35 }}
                    onDragEnd={(_, info) => {
                        if (info.offset.y < -40 || info.velocity.y < -350) setExpanded(true);
                        else if (info.offset.y > 70 && !expanded) onClose();
                        else if (info.offset.y > 50 && expanded) setExpanded(false);
                    }}
                    initial={{ y: '100%' }}
                    animate={{
                        y: 0,
                        height: expanded ? '68dvh' : '38dvh',
                        background: expanded ? 'rgba(15,23,42,0.93)' : 'rgba(15,23,42,0.58)',
                    }}
                    exit={{ y: '100%' }}
                    transition={SPRING}
                    style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 19,
                        backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
                        border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none',
                        borderRadius: '22px 22px 0 0',
                        boxShadow: '0 -8px 40px rgba(0,0,0,0.4)',
                        display: 'flex', flexDirection: 'column',
                        overflow: 'hidden', touchAction: 'none',
                    }}
                >
                    <div
                        onClick={(e) => { e.stopPropagation(); if (!expanded) setExpanded(true); }}
                        className={styles.dragHandle}
                        style={{
                            paddingTop: 10,
                            paddingBottom: expanded ? 4 : 6,
                            cursor: expanded ? 'default' : 'pointer',
                        }}
                    >
                        <div className={styles.handleBar} />
                        {!expanded && <span className={styles.swipeHint}>swipe up for details</span>}
                    </div>

                    <LocationSheetContent {...contentProps} isMobile />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
