'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { getFloorNumbers, FLOORPLANS } from '../data/floorplans';

/**
 * FloorSwitcher
 *
 * Bottom-left vertical control:
 *   - Master "Indoor view" toggle at top
 *   - Floor buttons below (highest floor on top), only shown when indoor mode is on
 *
 * Design language matches existing staff panels:
 *   background: rgba(15,23,42,0.75)
 *   backdrop-filter: blur(16px)
 *   primary accent: #1BA39C (teal)
 *   border radius: 12–16px
 *
 * Hides itself entirely when there is no active building with indoor data,
 * so it doesn't appear as dead UI outside buildings we have floor plans for.
 *
 * Props:
 *   isIndoorMode       boolean     whether indoor overlay is active
 *   setIsIndoorMode    (bool) =>   toggle handler
 *   buildingId         string      current building with indoor data (or null)
 *   activeFloor        number      currently selected floor
 *   setActiveFloor     (num) =>    floor select handler
 */
export default function FloorSwitcher({
  isIndoorMode,
  setIsIndoorMode,
  buildingId,
  activeFloor,
  setActiveFloor,
}) {
  // Hide entirely if there's no building with indoor data in scope.
  if (!buildingId || !FLOORPLANS[buildingId]) return null;

  const floorNumbers = getFloorNumbers(buildingId);
  const buildingName = FLOORPLANS[buildingId].name;

  const panelStyle = {
    position: 'absolute',
    left: 16,
    bottom: 24,
    zIndex: 5,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: 10,
    borderRadius: 16,
    background: 'rgba(15, 23, 42, 0.75)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
    minWidth: 88,
    pointerEvents: 'auto',
  };

  const toggleStyle = {
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
    background: isIndoorMode ? '#1BA39C' : 'rgba(255, 255, 255, 0.06)',
    color: isIndoorMode ? '#fff' : 'rgba(255, 255, 255, 0.85)',
    transition: 'background 160ms ease, color 160ms ease',
  };

  const floorBtnBase = {
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid rgba(255, 255, 255, 0.08)',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 0.4,
    transition: 'all 160ms ease',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={panelStyle}
    >
      <button
        type="button"
        onClick={() => setIsIndoorMode(!isIndoorMode)}
        style={toggleStyle}
        aria-pressed={isIndoorMode}
        title={`Toggle indoor view for ${buildingName}`}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: isIndoorMode ? '#fff' : '#1BA39C',
          }}
        />
        Indoor
      </button>

      <AnimatePresence initial={false}>
        {isIndoorMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden' }}
          >
            {floorNumbers.map((f) => {
              const floor = FLOORPLANS[buildingId].floors[f];
              const active = f === activeFloor;
              return (
                <motion.button
                  key={f}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setActiveFloor(f)}
                  title={floor.displayName}
                  style={{
                    ...floorBtnBase,
                    background: active ? '#1BA39C' : 'rgba(255, 255, 255, 0.04)',
                    color: active ? '#fff' : 'rgba(255, 255, 255, 0.8)',
                    borderColor: active
                      ? 'rgba(27, 163, 156, 0.9)'
                      : 'rgba(255, 255, 255, 0.08)',
                  }}
                  aria-pressed={active}
                >
                  {floor.label}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
