'use client';
// QR code display and share/copy button for a building location page.
import { useState } from 'react';
import GlassCard from './ui/GlassCard';
import styles from '../styles/LocationShareCard.module.css';

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
        <div className={styles.wrapper}>
            <GlassCard className={styles.card}>
                <div className={styles.header}>
                    <span className={styles.headerIcon}>📱</span>
                    <span className={styles.headerTitle}>Share this location</span>
                </div>
                <p className={styles.subtitle}>Scan the QR code or tap share</p>
                <img
                    src={`https://campusquesttud.s3.eu-west-1.amazonaws.com/photos/qr/${location.id}.png`}
                    alt={`QR code for ${location.name}`}
                    onError={e => e.currentTarget.style.display = 'none'}
                    className={styles.qrImg}
                />
                <button onClick={handleShare} className={styles.shareBtn}>
                    {copied ? '✓ Copied!' : 'Share Location'}
                </button>
            </GlassCard>
        </div>
    );
}
