"use client";

import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Box } from "@mui/material";
import { useRouter } from "next/navigation";

export default function QRScanner() {
    const router = useRouter();
    const scannerRef = useRef(null);

    useEffect(() => {
        // 1. Initialize the scanner
        const scanner = new Html5QrcodeScanner("reader", {
            fps: 15,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            rememberLastUsedCamera: true,
            showTorchButtonIfSupported: true,
        });

        // 2. Define success/error handlers
        const onScanSuccess = (decodedText) => {
            // In your case, the QR code contains the ID (e.g., "FBL")
            scanner.clear().then(() => {
                router.push(`/location/${decodedText.toUpperCase()}`);
            }).catch(err => console.error("Failed to clear scanner", err));
        };

        const onScanFailure = (error) => {
            // We usually ignore scan failures to keep the UI quiet
        };

        // 3. Render the scanner
        scanner.render(onScanSuccess, onScanFailure);
        scannerRef.current = scanner;

        // 4. Cleanup on unmount
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(e => console.warn("Scanner cleanup failed", e));
            }
        };
    }, [router]);

    return (
        <Box sx={{
            width: '100%',
            maxWidth: '450px',
            margin: '0 auto',
            '& #reader': { border: 'none !important' },
            '& #reader__dashboard_section_csr button': {
                backgroundColor: '#1BA39C !important',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer'
            }
        }}>
            <div id="reader"></div>
        </Box>
    );
}