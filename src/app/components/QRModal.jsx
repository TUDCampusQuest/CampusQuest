'use client';

import { QRCodeSVG } from 'qrcode.react';
import GlassCard from './ui/GlassCard';

export default function QRModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1300,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <GlassCard style={{ padding: 28, maxWidth: 300, width: '90%', textAlign: 'center' }}>
        <div style={{
          fontWeight: 800,
          fontSize: 18,
          color: 'var(--text-primary)',
          marginBottom: 16,
        }}>
          Scan to Open App
        </div>

        <QRCodeSVG
          value={process.env.NEXT_PUBLIC_APP_URL || 'https://campusquest.vercel.app'}
          size={200}
          bgColor="transparent"
          fgColor="#1BA39C"
          style={{ margin: '0 auto', display: 'block' }}
        />

        <div style={{
          fontSize: 12,
          color: 'var(--text-secondary)',
          marginTop: 12,
        }}>
          Point your camera at the code
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            height: 44,
            borderRadius: 10,
            border: 'none',
            background: '#1BA39C',
            color: '#fff',
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
            marginTop: 16,
          }}
        >
          Close
        </button>
      </GlassCard>
    </div>
  );
}
