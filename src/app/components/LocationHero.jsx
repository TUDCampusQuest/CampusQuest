'use client';
// Hero section for the location detail page: cover image, building name/ID badge, description, and info cards.
import styles from './LocationHero.module.css';

export default function LocationHero({ location, onBack }) {
    return (
        <>
            <div className={styles.heroWrapper}>
                <img src={location.image} alt={location.name} className={styles.heroImg} />
                <div className={styles.heroGradient} />
                <button onClick={onBack} aria-label="Go back" className={styles.backBtn}>←</button>
            </div>

            <div className={styles.identity}>
                <div className={styles.nameRow}>
                    <span className={styles.name}>{location.name}</span>
                    <span className={styles.idBadge}>{location.id}</span>
                </div>
                {location.description && (
                    <p className={styles.description}>{location.description}</p>
                )}
            </div>

            <div className={styles.infoCards}>
                {[
                    { icon: '🏢', label: 'Floors', value: location.floors?.join(', ') || 'N/A', accent: 'var(--accent-purple)' },
                    { icon: '♿', label: 'Access', value: 'Full Access', accent: 'var(--accent-teal)' },
                ].map(card => (
                    <div key={card.label} className={styles.infoCard} style={{ borderTop: `2px solid ${card.accent}` }}>
                        <div className={styles.infoCardIcon}>{card.icon}</div>
                        <div className={styles.infoCardLabel}>{card.label}</div>
                        <div className={styles.infoCardValue}>{card.value}</div>
                    </div>
                ))}
            </div>
        </>
    );
}
