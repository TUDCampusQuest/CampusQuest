'use client';
import { useState } from 'react';
import GlassCard from './ui/GlassCard';

export default function LocationShareCard({ location, pageUrl }) {
    const [copied, setCopied] = useState(false);

    async function handleShare() {
        try {
            if (navigator.share) {
                await navigator.share({ title: location?.name, text: `View ${location?.name} on CampusQuest`, url: pageUrl });
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(pageUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch {}
    }

    return (
        <div style={{ padding: '0 20px', marginTop: 16 }}>
            <GlassCard style={{ padding: 20, marginTop: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 18 }}>📱</span>
                    <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Share this location</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 12px' }}>
                    Scan the QR code or tap share
                </p>
                <img
                    src={`https://campusquesttud.s3.eu-west-1.amazonaws.com/photos/qr/${location.id}.png`}
                    alt={`QR code for ${location.name}`}
                    onError={e => e.currentTarget.style.display = 'none'}
                    style={{
                        width: 140, height: 140, borderRadius: 12,
                        display: 'block', margin: '0 auto',
                        background: '#fff', padding: 8,
                    }}
                />
                <button
                    onClick={handleShare}
                    style={{
                        width: '100%', height: 44, marginTop: 12, borderRadius: 10,
                        background: '#7C3AED', color: '#fff', border: 'none',
                        fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    }}
                >
                    {copied ? '✓ Copied!' : 'Share Location'}
                </button>
            </GlassCard>
        </div>
    );
}
