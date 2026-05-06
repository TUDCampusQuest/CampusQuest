'use client';
// Collapsible panel that lists available trails and lets admins toggle the trail designer.
import { useState } from 'react';
import styles from '../styles/TrailsPanel.module.css';

function trailLabel(key) {
    return key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function TrailsPanel({
    trailPaths, selectedTrailName, setTrailInUrl,
    isAdmin, showCaptureUI, onToggleCaptureUI,
}) {
    const [collapsed, setCollapsed] = useState(true);
    const trailKeys = Object.keys(trailPaths);

    return (
        <div className={styles.panel}>
            <button
                onClick={() => setCollapsed(c => !c)}
                className={`${styles.toggleBtn} ${!collapsed ? styles.toggleBtnOpen : ''}`}
            >
                <div className={styles.toggleLeft}>
                    <span className={styles.trailIcon}>🗺</span>
                    <span className={styles.trailsLabel}>Trails</span>
                    {trailKeys.length > 0 && (
                        <span className={styles.countBadge}>{trailKeys.length}</span>
                    )}
                </div>
                <span
                    className={styles.chevron}
                    style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
                >▼</span>
            </button>

            {!collapsed && (
                <>
                    <div className={styles.list}>
                        {trailKeys.length === 0 ? (
                            <p className={styles.emptyText}>No trails yet</p>
                        ) : trailKeys.map(key => {
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
                                    {trailLabel(key)}
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
