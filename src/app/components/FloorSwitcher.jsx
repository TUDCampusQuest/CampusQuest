'use client';

import { motion, AnimatePresence } from 'framer-motion';

const TEAL = '#1BA39C';

export default function FloorSwitcher({ activeBuilding, activeFloorId, onFloorChange }) {
    if (!activeBuilding) return null;

    const floors = [...activeBuilding.floors].sort((a, b) => b.z - a.z);

    return (
        <AnimatePresence>
            <motion.div
                key={activeBuilding.name}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{
                    position: 'absolute',
                    left: 16,
                    bottom: 24,
                    zIndex: 5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    padding: 10,
                    borderRadius: 16,
                    background: 'rgba(15,23,42,0.75)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                    minWidth: 110,
                    maxWidth: 160,
                    pointerEvents: 'auto',
                }}
            >
                {/* Building name */}
                <div style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.55)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                    padding: '2px 4px 2px',
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {activeBuilding.name}
                </div>

                {/* Floor buttons */}
                {floors.map(f => {
                    const active = f.floorId === activeFloorId;
                    return (
                        <motion.button
                            key={f.floorId}
                            type="button"
                            whileTap={{ scale: 0.96 }}
                            onClick={() => onFloorChange(f.floorId)}
                            title={`Floor ${f.name}`}
                            aria-pressed={active}
                            style={{
                                padding: '10px 12px',
                                borderRadius: 12,
                                border: '1px solid ' + (active ? 'rgba(27,163,156,0.9)' : 'rgba(255,255,255,0.08)'),
                                cursor: 'pointer',
                                fontSize: 13,
                                fontWeight: 700,
                                letterSpacing: 0.4,
                                transition: 'all 160ms ease',
                                background: active ? TEAL : 'rgba(255,255,255,0.04)',
                                color: active ? '#fff' : 'rgba(255,255,255,0.8)',
                            }}
                        >
                            {f.name}
                        </motion.button>
                    );
                })}
            </motion.div>
        </AnimatePresence>
    );
}
