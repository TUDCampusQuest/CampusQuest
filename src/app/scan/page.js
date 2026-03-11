"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useRouter } from "next/navigation";
import styles from ".././Scan.module.css";

export default function ScanPage() {
    const router = useRouter();
    const scannerRef = useRef(null);
    const hasScannedRef = useRef(false); // guard — prevents firing more than once
    const [status, setStatus] = useState("idle"); // idle | scanning | success | denied
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        let html5Qrcode;

        const startScanner = async () => {

            // 1. Ask for camera permission explicitly so the browser prompt appears
            try {
                await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                });
            } catch {
                setStatus("denied");
                setErrorMsg("Camera permission denied. Please allow access in your browser settings and refresh.");
                return;
            }

            // 2. Initialise the scanner against the div
            try {
                html5Qrcode = new Html5Qrcode("cq-reader");
                scannerRef.current = html5Qrcode;
                setStatus("scanning");

                await html5Qrcode.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 240, height: 240 } },

                    // Success callback
                    async (decoded) => {
                        // Guard: ignore any duplicate fires after the first successful scan
                        if (hasScannedRef.current) return;
                        hasScannedRef.current = true;

                        setStatus("success");

                        // Stop the camera stream first, then navigate.
                        // Awaiting stop() ensures the stream is released before we leave
                        // the page, which prevents the scanner hanging on iOS/Android.
                        try {
                            await html5Qrcode.stop();
                        } catch {
                            // stop() can throw if the stream already ended — safe to ignore
                        }

                        router.push(`/location/${decoded.trim().toUpperCase()}`);
                    },

                    // Per-frame failure — expected, suppress silently
                    () => {}
                );
            } catch (err) {
                console.error("Scanner start error:", err);
                setStatus("denied");
                setErrorMsg("Could not access the camera. Check permissions and try again.");
            }
        };

        startScanner();

        // Cleanup: stop the stream when the user navigates away
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => {});
            }
        };
    }, [router]);

    const isSuccess = status === "success";
    const isDenied  = status === "denied";
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

                        {/* html5-qrcode mounts the video stream into this div */}
                        <div id="cq-reader" style={{ width: "100%", height: "100%" }} />

                        {/* Permission denied state */}
                        {isDenied && (
                            <div className={styles.deniedOverlay}>
                                <span style={{ fontSize: "2rem" }}>🚫</span>
                                <p className={styles.deniedText}>{errorMsg}</p>
                            </div>
                        )}

                        {/* Viewfinder overlay */}
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
              {status === "idle"     && "Starting camera…"}
                            {status === "scanning" && "Align a Campus Quest QR code within the frame"}
                            {status === "success"  && "QR code detected — opening location…"}
                            {status === "denied"   && "Camera access required to scan QR codes"}
            </span>
                    </div>
                </div>

                <p className={styles.hint}>QR codes are posted at every building entrance</p>
            </div>
        </div>
    );
}