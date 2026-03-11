"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useRouter } from "next/navigation";
import styles from ".././Scan.module.css";

export default function ScanPage() {
    const router = useRouter();
    const scannerRef = useRef(null);
    const [status, setStatus] = useState("idle");     // idle | requesting | scanning | success | denied
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        let html5Qrcode;

        const startScanner = async () => {
            setStatus("requesting");

            try {
                // Explicitly request camera permission first so the browser
                // shows the native permission prompt before the scanner starts
                await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            } catch {
                setStatus("denied");
                setErrorMsg("Camera permission was denied. Please allow camera access in your browser settings and refresh.");
                return;
            }

            try {
                html5Qrcode = new Html5Qrcode("cq-reader");
                scannerRef.current = html5Qrcode;

                setStatus("scanning");

                await html5Qrcode.start(
                    // Request the rear-facing camera directly
                    { facingMode: "environment" },
                    {
                        fps: 12,
                        qrbox: { width: 240, height: 240 },
                    },
                    (decoded) => {
                        // Success — stop scanning and navigate
                        setStatus("success");
                        html5Qrcode.stop().catch(() => {});
                        setTimeout(() => {
                            router.push(`/location/${decoded.toUpperCase()}`);
                        }, 900);
                    },
                    () => {} // per-frame failures are expected — suppress silently
                );
            } catch (err) {
                console.error("Scanner start error:", err);
                setStatus("denied");
                setErrorMsg("Could not start the camera. Please check permissions and try again.");
            }
        };

        startScanner();

        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => {});
            }
        };
    }, [router]);

    const isSuccess = status === "success";
    const isDenied = status === "denied";
    const accentColor = isSuccess ? "#4ade80" : "#1BA39C";

    const corners = [
        { top: 0,    left: 0,    borderTop: true,    borderLeft: true,  borderRadius: "6px 0 0 0" },
        { top: 0,    right: 0,   borderTop: true,    borderRight: true, borderRadius: "0 6px 0 0" },
        { bottom: 0, left: 0,    borderBottom: true, borderLeft: true,  borderRadius: "0 0 0 6px" },
        { bottom: 0, right: 0,   borderBottom: true, borderRight: true, borderRadius: "0 0 6px 0" },
    ];

    return (
        <div className={styles.page}>
            <div className={styles.glow} />

            {/* Header */}
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

            {/* Camera card */}
            <div className={styles.cardWrap}>
                <div className={styles.card}>
                    <div className={styles.videoBox}>

                        {/* html5-qrcode renders the video feed into this div */}
                        <div id="cq-reader" style={{ width: "100%", height: "100%" }} />

                        {/* Permission denied overlay */}
                        {isDenied && (
                            <div className={styles.deniedOverlay}>
                                <span style={{ fontSize: "2rem" }}>🚫</span>
                                <p className={styles.deniedText}>{errorMsg}</p>
                            </div>
                        )}

                        {/* Viewfinder overlay — only shown while scanning or on success */}
                        {!isDenied && (
                            <div className={styles.overlay}>
                                <div className={styles.vignette} />
                                <div className={styles.frame}>
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
                                    {isSuccess && <div className={styles.tick}>✓</div>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Status strip */}
                    <div className={styles.strip}>
                        <div className={`${styles.dot} ${isSuccess ? styles.success : styles.active}`} />
                        <span className={`${styles.stripText} ${isSuccess ? styles.success : ""}`}>
              {status === "requesting" && "Requesting camera permission…"}
                            {status === "scanning"   && "Align a Campus Quest QR code within the frame"}
                            {status === "success"    && "QR code detected — opening location…"}
                            {status === "denied"     && "Camera access required to scan QR codes"}
                            {status === "idle"       && "Starting camera…"}
            </span>
                    </div>
                </div>

                <p className={styles.hint}>QR codes are posted at every building entrance</p>
            </div>
        </div>
    );
}