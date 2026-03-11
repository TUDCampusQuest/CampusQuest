"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useRouter } from "next/navigation";
import styles from ".././Scan.module.css";

export default function ScanPage() {
    const router = useRouter();
    const scannerRef = useRef(null);
    const [status, setStatus] = useState("idle"); // idle | success

    useEffect(() => {
        // Small delay ensures the DOM node is painted before html5-qrcode initialises
        const timer = setTimeout(() => {
            const scanner = new Html5QrcodeScanner(
                "cq-reader",
                {
                    fps: 12,
                    qrbox: { width: 240, height: 240 },
                    facingMode: "environment",
                    rememberLastUsedCamera: false,
                    showTorchButtonIfSupported: false,
                    showZoomSliderIfSupported: false,
                },
                false // verbose off
            );

            scanner.render(
                (decoded) => {
                    setStatus("success");
                    scanner.clear().catch(() => {});
                    setTimeout(() => {
                        router.push(`/location/${decoded.toUpperCase()}`);
                    }, 900);
                },
                () => {} // per-frame scan failures are expected — suppress silently
            );

            scannerRef.current = scanner;
        }, 120);

        return () => {
            clearTimeout(timer);
            scannerRef.current?.clear().catch(() => {});
        };
    }, [router]);

    const isSuccess = status === "success";
    const TEAL = "#1BA39C";
    const GREEN = "#4ade80";
    const accentColor = isSuccess ? GREEN : TEAL;

    // Corner bracket definitions — border sides and radius set per corner
    const corners = [
        { top: 0,    left: 0,    borderTop: true,    borderLeft: true,  borderRadius: "6px 0 0 0"  },
        { top: 0,    right: 0,   borderTop: true,    borderRight: true, borderRadius: "0 6px 0 0"  },
        { bottom: 0, left: 0,    borderBottom: true, borderLeft: true,  borderRadius: "0 0 0 6px"  },
        { bottom: 0, right: 0,   borderBottom: true, borderRight: true, borderRadius: "0 0 6px 0"  },
    ];

    return (
        <div className={styles.page}>

            {/* Ambient teal glow */}
            <div className={styles.glow} />

            {/* ── Header ─────────────────────────────────────── */}
            <div className={styles.header}>
                <button
                    className={styles.backBtn}
                    onClick={() => router.push("/")}
                    aria-label="Back to map"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2.5"
                         strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>

                <div>
                    <div className={styles.headerTitle}>Scan QR Code</div>
                    <div className={styles.headerSub}>TU Dublin · Campus Quest</div>
                </div>
            </div>

            {/* ── Camera card ────────────────────────────────── */}
            <div className={styles.cardWrap}>
                <div className={styles.card}>

                    {/* Video feed — html5-qrcode renders into #cq-reader */}
                    <div className={styles.videoBox}>
                        <div id="cq-reader" style={{ width: "100%", height: "100%" }} />

                        {/* Viewfinder overlay */}
                        <div className={styles.overlay}>
                            <div className={styles.vignette} />

                            <div className={styles.frame}>
                                {/* Four corner brackets */}
                                {corners.map((c, i) => (
                                    <div
                                        key={i}
                                        className={styles.corner}
                                        style={{
                                            top:          c.top    !== undefined ? c.top    : "auto",
                                            bottom:       c.bottom !== undefined ? c.bottom : "auto",
                                            left:         c.left   !== undefined ? c.left   : "auto",
                                            right:        c.right  !== undefined ? c.right  : "auto",
                                            borderTop:    c.borderTop    ? `3px solid ${accentColor}` : "none",
                                            borderBottom: c.borderBottom ? `3px solid ${accentColor}` : "none",
                                            borderLeft:   c.borderLeft   ? `3px solid ${accentColor}` : "none",
                                            borderRight:  c.borderRight  ? `3px solid ${accentColor}` : "none",
                                            borderRadius: c.borderRadius,
                                            transition:   "border-color 0.3s ease",
                                        }}
                                    />
                                ))}

                                {/* Success checkmark */}
                                {isSuccess && <div className={styles.tick}>✓</div>}
                            </div>
                        </div>
                    </div>

                    {/* Status strip */}
                    <div className={styles.strip}>
                        <div
                            className={`${styles.dot} ${isSuccess ? styles.success : styles.active}`}
                        />
                        <span className={`${styles.stripText} ${isSuccess ? styles.success : ""}`}>
              {isSuccess
                  ? "QR code detected — opening location…"
                  : "Align a Campus Quest QR code within the frame"}
            </span>
                    </div>
                </div>

                <p className={styles.hint}>
                    QR codes are posted at every building entrance
                </p>
            </div>
        </div>
    );
}