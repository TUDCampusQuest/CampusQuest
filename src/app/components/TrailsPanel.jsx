'use client';
// Collapsible map overlay listing saved trails by name; admins also get the Trail Designer toggle.

import { useState } from 'react';
import styles from '../styles/TrailsPanel.module.css';

function toLabel(key) {
    return key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function TrailsPanel({
    trailPaths,
    selectedTrailName,
    setTrailInUrl,
    isAdmin,
    showCaptureUI,
    onToggleCaptureUI,
}) {
    const [collapsed, setCollapsed] = useState(true);
    const keys = Object.keys(trailPaths);

    return (
        <div className={styles.panel}>
            <button
                onClick={() => setCollapsed(c => !c)}
                className={`${styles.toggleBtn} ${!collapsed ? styles.toggleBtnOpen : ''}`}
            >
                <div className={styles.toggleLeft}>
                    <span className={styles.trailIcon}>🗺</span>
                    <span className={styles.trailsLabel}>Trails</span>
                    {keys.length > 0 && (
                        <span className={styles.countBadge}>{keys.length}</span>
                    )}
                </div>
                <span
                    className={styles.chevron}
                    style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
                >
                    ▼
                </span>
            </button>

            {!collapsed && (
                <>
                    <div className={styles.list}>
                        {keys.length === 0 ? (
                            <p className={styles.emptyText}>No trails yet</p>
                        ) : keys.map(key => {
                            const active = selectedTrailName === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setTrailInUrl(key)}
                                    className={`${styles.trailBtn} ${active ? styles.trailBtnActive : styles.trailBtnInactive}`}
                                >
                                    <span
                                        className={styles.trailDot}
                                        style={{ background: active ? 'rgba(255,255,255,0.9)' : '#1BA39C' }}
                                    />
                                    {toLabel(key)}
                                </button>
                            );
                        })}

                        {selectedTrailName && (
                            <button onClick={() => setTrailInUrl(null)} className={styles.clearBtn}>
                                ✕ Clear selection
                            </button>
                        )}
                    </div>

                    {isAdmin && (
                        <div className={styles.adminSection}>
                            <button
                                onClick={onToggleCaptureUI}
                                className={`${styles.designerBtn} ${showCaptureUI ? styles.designerBtnOpen : styles.designerBtnClosed}`}
                            >
                                <span>{showCaptureUI ? '←' : '✏'}</span>
                                {showCaptureUI ? 'Close Designer' : 'Trail Designer'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
