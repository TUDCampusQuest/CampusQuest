'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Map, { Source, Layer, Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FLOORPLANS, INDOOR_BUILDINGS } from '../../data/floorplans';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const STORAGE_KEY = 'cq:calibration';

const CORNER_LABELS = ['NW', 'NE', 'SE', 'SW'];

function loadSaved(buildingId, floor) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data?.[buildingId]?.[floor] ?? null;
  } catch {
    return null;
  }
}

function saveProgress(buildingId, floor, coords) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    data[buildingId] = data[buildingId] || {};
    data[buildingId][floor] = coords;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export default function CalibratePage() {
  const [buildingId, setBuildingId] = useState(INDOOR_BUILDINGS[0] ?? 'F-BLOCK');
  const [floor, setFloor] = useState(0);
  const [opacity, setOpacity] = useState(0.6);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const building = FLOORPLANS[buildingId];
  const floorCfg = building?.floors?.[floor];

  const [corners, setCorners] = useState(() => floorCfg?.coordinates ?? []);

  useEffect(() => {
    const saved = loadSaved(buildingId, floor);
    if (saved) setCorners(saved);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const switchFloor = useCallback(
    (nextBuilding, nextFloor) => {
      const cfg = FLOORPLANS[nextBuilding]?.floors?.[nextFloor];
      const saved = loadSaved(nextBuilding, nextFloor);
      setBuildingId(nextBuilding);
      setFloor(nextFloor);
      setCorners(saved ?? cfg?.coordinates ?? []);
    },
    [],
  );

  const updateCorner = useCallback(
    (idx, lng, lat) => {
      setCorners((prev) => {
        const next = prev.map((c, i) => (i === idx ? [lng, lat] : c));
        saveProgress(buildingId, floor, next);
        return next;
      });
    },
    [buildingId, floor],
  );

  const flashToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  };

  const resetToPlaceholder = useCallback(() => {
    const cfg = FLOORPLANS[buildingId]?.floors?.[floor];
    if (cfg?.coordinates) {
      setCorners(cfg.coordinates);
      saveProgress(buildingId, floor, cfg.coordinates);
      flashToast('Reset to placeholder');
    }
  }, [buildingId, floor]);

  const copyCoords = useCallback(async () => {
    const formatted = formatCoordsForPaste(corners);
    try {
      await navigator.clipboard.writeText(formatted);
      flashToast('Coordinates copied to clipboard');
    } catch {
      window.prompt('Copy the coordinates:', formatted);
    }
  }, [corners]);

  const initialView = useMemo(() => {
    const [lng, lat] = building?.center ?? [-6.378376, 53.404758];
    return { longitude: lng, latitude: lat, zoom: 19 };
  }, [building]);

  if (!MAPBOX_TOKEN) {
    return (
      <div style={errorPage}>
        <h2>Mapbox token not configured</h2>
        <p>
          Add <code>NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> to your
          <code> .env.local</code> and restart the dev server.
        </p>
      </div>
    );
  }

  const imageSourceReady =
    corners.length === 4 && corners.every((c) => Array.isArray(c) && c.length === 2);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0b1220' }}>
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={initialView}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        style={{ width: '100%', height: '100%' }}
        maxZoom={22}
      >
        {imageSourceReady && floorCfg?.image && (
          <Source
            key={`calib-${buildingId}-${floor}`}
            id="calibration-image"
            type="image"
            url={floorCfg.image}
            coordinates={corners}
          >
            <Layer
              id="calibration-image-layer"
              type="raster"
              source="calibration-image"
              paint={{ 'raster-opacity': opacity }}
            />
          </Source>
        )}

        {corners.map((c, idx) => (
          <Marker
            key={`${buildingId}-${floor}-${idx}`}
            longitude={c[0]}
            latitude={c[1]}
            draggable
            onDrag={(e) => updateCorner(idx, e.lngLat.lng, e.lngLat.lat)}
            anchor="center"
          >
            <div style={cornerHandleStyle}>
              <span style={cornerLabelStyle}>{CORNER_LABELS[idx]}</span>
            </div>
          </Marker>
        ))}
      </Map>

      <div style={panelStyle}>
        <h3 style={panelTitleStyle}>Floor plan calibration</h3>

        <label style={fieldLabelStyle}>Building</label>
        <select
          value={buildingId}
          onChange={(e) => switchFloor(e.target.value, floor)}
          style={selectStyle}
        >
          {INDOOR_BUILDINGS.map((id) => (
            <option key={id} value={id}>
              {FLOORPLANS[id].name}
            </option>
          ))}
        </select>

        <label style={fieldLabelStyle}>Floor</label>
        <select
          value={floor}
          onChange={(e) => switchFloor(buildingId, Number(e.target.value))}
          style={selectStyle}
        >
          {building &&
            Object.keys(building.floors).map((f) => (
              <option key={f} value={f}>
                {building.floors[f].label} — {building.floors[f].displayName}
              </option>
            ))}
        </select>

        <label style={fieldLabelStyle}>
          Image opacity: {Math.round(opacity * 100)}%
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#1BA39C' }}
        />

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button type="button" onClick={copyCoords} style={primaryBtnStyle}>
            Copy coords
          </button>
          <button type="button" onClick={resetToPlaceholder} style={secondaryBtnStyle}>
            Reset
          </button>
        </div>

        <div style={hintStyle}>
          Drag the NW / NE / SE / SW handles to align the floor plan with
          the building footprint. Progress auto-saves. After copying,
          paste into <code>src/app/data/floorplans.js</code> for this
          floor.
        </div>

        {corners.length === 4 && (
          <pre style={previewStyle}>{formatCoordsForPaste(corners)}</pre>
        )}
      </div>

      {toast && <div style={toastStyle}>{toast}</div>}
    </div>
  );
}

function formatCoordsForPaste(corners) {
  const lines = corners.map((c, i) => {
    const lng = c[0].toFixed(6);
    const lat = c[1].toFixed(6);
    const trail =
      i === 0 ? ' // NW (top-left)'
      : i === 1 ? ' // NE (top-right)'
      : i === 2 ? ' // SE (bottom-right)'
      : ' // SW (bottom-left)';
    return `  [${lng}, ${lat}],${trail}`;
  });
  return `coordinates: [\n${lines.join('\n')}\n],`;
}

const panelStyle = {
  position: 'absolute',
  top: 16,
  right: 16,
  width: 320,
  padding: 16,
  borderRadius: 16,
  background: 'rgba(15, 23, 42, 0.75)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
  color: '#fff',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  zIndex: 10,
};

const panelTitleStyle = {
  margin: '0 0 12px 0',
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: 0.3,
  color: '#1BA39C',
};

const fieldLabelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: 'rgba(255, 255, 255, 0.65)',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  marginTop: 10,
  marginBottom: 4,
};

const selectStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 10,
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  color: '#fff',
  fontSize: 13,
  outline: 'none',
};

const primaryBtnStyle = {
  flex: 1,
  padding: '10px 12px',
  borderRadius: 12,
  border: 'none',
  background: '#1BA39C',
  color: '#fff',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};

const secondaryBtnStyle = {
  padding: '10px 14px',
  borderRadius: 12,
  border: '1px solid rgba(255, 255, 255, 0.12)',
  background: 'rgba(255, 255, 255, 0.04)',
  color: '#fff',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};

const hintStyle = {
  marginTop: 12,
  fontSize: 11,
  lineHeight: 1.5,
  color: 'rgba(255, 255, 255, 0.6)',
};

const previewStyle = {
  marginTop: 12,
  padding: 10,
  borderRadius: 10,
  background: 'rgba(0, 0, 0, 0.35)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  color: '#cfe8e6',
  fontSize: 11,
  lineHeight: 1.45,
  overflowX: 'auto',
  whiteSpace: 'pre',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
};

const cornerHandleStyle = {
  width: 22,
  height: 22,
  borderRadius: '50%',
  background: '#1BA39C',
  border: '3px solid #fff',
  boxShadow: '0 0 0 2px rgba(27,163,156,0.45), 0 4px 10px rgba(0,0,0,0.35)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'grab',
};

const cornerLabelStyle = {
  position: 'absolute',
  top: -22,
  fontSize: 10,
  fontWeight: 700,
  color: '#fff',
  background: 'rgba(15,23,42,0.85)',
  padding: '2px 5px',
  borderRadius: 4,
  letterSpacing: 0.5,
  pointerEvents: 'none',
};

const toastStyle = {
  position: 'absolute',
  bottom: 32,
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '10px 16px',
  borderRadius: 12,
  background: 'rgba(15, 23, 42, 0.9)',
  color: '#fff',
  fontSize: 13,
  fontWeight: 500,
  border: '1px solid rgba(27, 163, 156, 0.5)',
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
  zIndex: 20,
};

const errorPage = {
  padding: 32,
  color: '#fff',
  fontFamily: 'system-ui, sans-serif',
  background: '#0b1220',
  minHeight: '100vh',
};
