'use client';

export default function GeofenceBanner({ entrance, onDismiss, onScanQR }) {
  if (!entrance) return null;

  return (
    <div style={{ position: 'absolute', top: 60, left: 8, right: 8, zIndex: 1050 }}>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--glass-border)',
        borderLeft: '4px solid #1BA39C',
        borderRadius: 14,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: 'var(--card-shadow)',
        animation: 'slideDown 0.25s ease forwards',
      }}>
        <span style={{ fontSize: 20 }}>📍</span>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
            Near {entrance.buildingName}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Scan to navigate inside
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={onScanQR}
            style={{
              background: '#1BA39C',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Scan QR
          </button>
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 18,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0 4px',
            }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
