"use client";

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";
import { Box, Typography, IconButton, Button, Paper, Stack } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useRouter } from "next/navigation";

export default function ScanPage() {
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [scanner, setScanner] = useState(null);

    useEffect(() => {
        const newScanner = new Html5QrcodeScanner("reader", {
            qrbox: { width: 250, height: 250 },
            fps: 10,
        });

        newScanner.render(onScanSuccess, onScanFailure);
        setScanner(newScanner);

        return () => {
            newScanner.clear().catch((error) => console.error("Failed to clear", error));
        };
    }, []);

    function onScanSuccess(decodedText) {
        // Navigate to the building page
        router.push(`/location/${decodedText.toUpperCase()}`);
    }

    function onScanFailure(error) {
        // Ignore constant scanning errors
    }

    // FILE UPLOAD HANDLER
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Use the Html5Qrcode class (not the scanner UI) for file scanning
        const html5QrCode = new Html5Qrcode("reader");

        try {
            const decodedText = await html5QrCode.scanFile(file, true);
            onScanSuccess(decodedText);
        } catch (err) {
            alert("Could not find a QR code in this image. Try a clearer photo.");
            console.error("File scan error:", err);
        }
    };

    return (
        <Box sx={{ height: "100vh", bgcolor: "#000", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <Box sx={{ p: 2, display: "flex", alignItems: "center", zIndex: 10 }}>
                <IconButton onClick={() => router.push("/")} sx={{ color: "white", bgcolor: "rgba(255,255,255,0.1)" }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" sx={{ ml: 2, color: "white", fontWeight: 700 }}>
                    Scan Building
                </Typography>
            </Box>

            {/* Camera View */}
            <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", p: 2 }}>
                <Paper sx={{ width: "100%", maxWidth: 400, borderRadius: 4, overflow: "hidden", bgcolor: "black" }}>
                    <div id="reader"></div>
                </Paper>
            </Box>

            {/* Upload Controls */}
            <Stack spacing={2} sx={{ p: 4, alignItems: "center" }}>
                <Typography variant="body2" sx={{ color: "white", opacity: 0.7 }}>
                    Can't scan? Upload a photo instead
                </Typography>

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                />

                <Button
                    variant="outlined"
                    startIcon={<FileUploadIcon />}
                    onClick={() => fileInputRef.current.click()}
                    sx={{
                        color: "white",
                        borderColor: "white",
                        borderRadius: "12px",
                        px: 4,
                        "&:hover": { borderColor: "#1BA39C", color: "#1BA39C" }
                    }}
                >
                    Upload QR Image
                </Button>
            </Stack>
        </Box>
    );
}