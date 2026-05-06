'use client';
// Building info sheet content: hero image, name, description, floors info, and action buttons.
import styles from '../styles/LocationSheetContent.module.css';

function Btn({ label, onClick, primary }) {
    return (
        <button
            onClick={onClick}
            className={primary ? `${styles.btn} ${styles.btnPrimary}` : `${styles.btn} ${styles.btnSecondary}`}
        >
            {label}
        </button>
    );
}

export default function LocationSheetContent({
    location, onClose, onNavigate, onSetAsStart, onViewDetails, isMobile,
}) {
    if (!location) return null;

    return (
        <div className={styles.wrapper}>

            <div
                className={styles.heroWrapper}
                style={{ height: isMobile ? 145 : 200 }}
            >
                {location.image ? (
                    <img
                        src={location.image}
                        alt={location.name}
                        className={styles.heroImg}
                        onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                ) : (
                    <div className={styles.heroFallback} />
                )}

                <div className={styles.heroGradient} />

                <button onClick={onClose} className={styles.closeBtn}>×</button>

                <span className={styles.buildingBadge}>{location.id}</span>
            </div>

            <div className={styles.body}>
                <div className={styles.name}>{location.name}</div>
                <div className={styles.description}>{location.description}</div>

                <div className={styles.divider} />

                {location.floors?.length > 0 && (
                    <div className={styles.floorsRow}>
                        <div className={styles.floorsIcon}>🏢</div>
                        <div>
                            <div className={styles.floorsLabel}>Floors</div>
                            <div className={styles.floorsValue}>{location.floors.join(', ')}</div>
                        </div>
                    </div>
                )}
            </div>

            <div
                className={styles.actions}
                style={{ paddingBottom: isMobile ? 'max(14px, env(safe-area-inset-bottom))' : 16 }}
            >
                <div className={styles.btns}>
                    <Btn label="View Details" onClick={onViewDetails} />
                    {onSetAsStart && <Btn label="Set as Start" onClick={onSetAsStart} />}
                    <Btn label="▲ Navigate" onClick={onNavigate} primary />
                </div>
            </div>
        </div>
    );
}
