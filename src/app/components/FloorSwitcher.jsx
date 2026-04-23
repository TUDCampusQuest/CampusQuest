'use client';

import { motion, AnimatePresence } from 'framer-motion';

const TEAL = '#1BA39C';

export default function FloorSwitcher({
    activeBuilding,
    activeFloorId,
    onFloorChange,
    indoorMode,
    onToggleIndoor,
}) {
    const floors = activeBuilding
        ? [...activeBuilding.floors].sort((a, b) => b.z - a.z)
        : [];

    return (
        <motion.div
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
                gap: 8,
                padding: 10,
                borderRadius: 16,
                background: 'rgba(15,23,42,0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                minWidth: 120,
                maxWidth: 170,
                pointerEvents: 'auto',
            }}
        >
            <button
                type="button"
                onClick={onToggleIndoor}
                aria-pressed={indoorMode}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 10px',
                    borderRadius: 12,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: 0.2,
                    background: indoorMode ? TEAL : 'rgba(255,255,255,0.06)',
                    color: indoorMode ? '#fff' : 'rgba(255,255,255,0.85)',
                    transition: 'background 160ms ease, color 160ms ease',
                }}
            >
                <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: indoorMode ? '#fff' : TEAL,
                }} />
                Indoor
            </button>

            <AnimatePresence initial={false}>
                {indoorMode && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden' }}
                    >
                        {!activeBuilding ? (
                            <div style={{
                                fontSize: 11,
                                fontWeight: 500,
                                color: 'rgba(255,255,255,0.65)',
                                padding: '10px 6px',
                                textAlign: 'center',
                                lineHeight: 1.4,
                            }}>
                                Select a building<br />to view floors
                            </div>
                        ) : (
                            <>
                                <div
                                    title={activeBuilding.name}
                                    style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: 'rgba(255,255,255,0.55)',
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.6,
                                        padding: '2px 4px 4px',
                                        textAlign: 'center',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {activeBuilding.name}
                                </div>
                                {floors.map((f) => {
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
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
