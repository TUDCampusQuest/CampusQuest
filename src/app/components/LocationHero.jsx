'use client';

export default function LocationHero({ location, onBack }) {
    return (
        <>
            {/* Hero image */}
            <div style={{ position: 'relative', width: '100%', height: 220, flexShrink: 0 }}>
                <img
                    src={location.image}
                    alt={location.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, var(--bg-primary) 0%, transparent 60%)',
                    pointerEvents: 'none',
                }} />
                <button
                    onClick={onBack}
                    aria-label="Go back"
                    style={{
                        position: 'absolute', top: 16, left: 16,
                        width: 40, height: 40, borderRadius: '50%',
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid var(--glass-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#fff', fontSize: 20,
                    }}
                >
                    ←
                </button>
            </div>

            {/* Building identity */}
            <div style={{ padding: '0 20px', marginTop: -40, position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                        {location.name}
                    </span>
                    <span style={{
                        background: 'var(--accent-purple)', color: '#fff',
                        fontSize: 12, fontWeight: 700, borderRadius: 20,
                        padding: '3px 10px', display: 'inline-block',
                    }}>
                        {location.id}
                    </span>
                </div>
                {location.description && (
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '8px 0 0', lineHeight: 1.6 }}>
                        {location.description}
                    </p>
                )}
            </div>

            {/* Info cards */}
            <div style={{ padding: '16px 20px 0', display: 'flex', gap: 12 }}>
                {[
                    { icon: '🏢', label: 'Floors', value: location.floors?.join(', ') || 'N/A', accent: 'var(--accent-purple)' },
                    { icon: '♿', label: 'Access', value: 'Full Access', accent: 'var(--accent-teal)' },
                ].map(card => (
                    <div key={card.label} style={{
                        flex: 1, padding: 14,
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid var(--glass-border)',
                        borderTop: `2px solid ${card.accent}`,
                        borderRadius: 16, boxShadow: 'var(--card-shadow)',
                    }}>
                        <div style={{ fontSize: 22, marginBottom: 6 }}>{card.icon}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
                            {card.label}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginTop: 3 }}>
                            {card.value}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
