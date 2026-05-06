'use client';
// Floating UI overlays rendered on top of the map: arrived toast, pick-from-map banner, and stairs floor-change prompt.
import styles from '../styles/MapOverlays.module.css';

export function ArrivedToast({ show }) {
    if (!show) return null;
    return <div className={styles.arrivedToast}>✅ You have arrived!</div>;
}

export function PickFromMapBanner({ field, onCancel }) {
    if (!field) return null;
    return (
        <div className={styles.pickBanner}>
            <span>📌 Tap the map to set {field === 'A' ? 'start point' : 'destination'}</span>
            <button onClick={onCancel} className={styles.pickBannerClose}>✕</button>
        </div>
    );
}

export function StairsPrompt({ show, floorName }) {
    if (!show) return null;
    return (
        <div className={styles.stairsPrompt}>
            <span className={styles.stairsIcon}>🪜</span>
            <div>
                <div className={styles.stairsTitle}>Head to the stairs</div>
                <div className={styles.stairsSubtitle}>Your destination is on floor {floorName} — map updated</div>
            </div>
        </div>
    );
}
