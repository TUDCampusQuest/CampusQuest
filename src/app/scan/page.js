"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Box, Typography, Button, IconButton, Stack } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from "next/navigation";

export default function ScanPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const scannerRef = useRef(null);

<<<<<<< HEAD
  // 1. Only handle mounting first
=======
>>>>>>> cea9bbdf4e0eaf2ac994fdc38dc0dd30b256b790
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

<<<<<<< HEAD
  // 2. Only handle scanner initialization AFTER mounting is confirmed
=======
>>>>>>> cea9bbdf4e0eaf2ac994fdc38dc0dd30b256b790
  useEffect(() => {
    if (isMounted && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 20, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0 
      });

      scanner.render(
        (decodedText) => {
          scanner.clear();
          router.push(`/location/${decodedText.toUpperCase()}`);
        },
        (error) => { /* scanning... */ }
      );

      scannerRef.current = scanner;
    }

<<<<<<< HEAD
    // Cleanup
=======
>>>>>>> cea9bbdf4e0eaf2ac994fdc38dc0dd30b256b790
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.warn("Scanner clear error", e));
        scannerRef.current = null;
      }
    };
  }, [isMounted, router]);

  const handleSimulate = () => {
    router.push('/location/FBL');
  };

<<<<<<< HEAD
  // If not mounted, show a matching background color to prevent "flicker"
=======
>>>>>>> cea9bbdf4e0eaf2ac994fdc38dc0dd30b256b790
  if (!isMounted) {
    return <Box sx={{ height: '100vh', bgcolor: '#1a1f2b' }} />;
  }

  return (
    <Box sx={{ 
      height: '100vh', 
      bgcolor: '#1a1f2b', 
      color: 'white', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
<<<<<<< HEAD
      {/* HEADER */}
=======
>>>>>>> cea9bbdf4e0eaf2ac994fdc38dc0dd30b256b790
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => router.back()} sx={{ color: 'white' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 600 }}>
          Scan QR Code
        </Typography>
        <Box sx={{ width: 40 }} />
      </Box>

<<<<<<< HEAD
      {/* SCANNER VIEWPORT */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: -4 }}>
        <Box sx={{ position: 'relative', width: 280, height: 280, mb: 4 }}>
          {/* Green Corner Brackets */}
=======
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: -4 }}>
        <Box sx={{ position: 'relative', width: 280, height: 280, mb: 4 }}>
>>>>>>> cea9bbdf4e0eaf2ac994fdc38dc0dd30b256b790
          <Box sx={{ position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderLeft: '4px solid #34d399', borderTop: '4px solid #34d399', borderTopLeftRadius: 20, zIndex: 2 }} />
          <Box sx={{ position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderRight: '4px solid #34d399', borderTop: '4px solid #34d399', borderTopRightRadius: 20, zIndex: 2 }} />
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderLeft: '4px solid #34d399', borderBottom: '4px solid #34d399', borderBottomLeftRadius: 20, zIndex: 2 }} />
          <Box sx={{ position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderRight: '4px solid #34d399', borderBottom: '4px solid #34d399', borderBottomRightRadius: 20, zIndex: 2 }} />
          
          <Box sx={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: 4, bgcolor: '#000' }}>
            <div id="reader" style={{ width: '100%' }}></div>
          </Box>
        </Box>
        <Typography variant="body2" sx={{ color: '#94a3b8' }}>Align QR code within the frame</Typography>
      </Box>

<<<<<<< HEAD
      {/* BUTTONS */}
=======
>>>>>>> cea9bbdf4e0eaf2ac994fdc38dc0dd30b256b790
      <Box sx={{ p: 3, pb: 8 }}>
        <Stack spacing={2}>
          <Button 
            fullWidth 
            variant="contained"
            onClick={handleSimulate}
            sx={{ 
              bgcolor: '#1BA39C', 
              py: 2, 
              borderRadius: '12px', 
              fontWeight: 700,
              '&:hover': { bgcolor: '#16867f' }
            }}
          >
<<<<<<< HEAD
            Simulate QR Scan (Demo)
=======
            Simulate QR Scan
>>>>>>> cea9bbdf4e0eaf2ac994fdc38dc0dd30b256b790
          </Button>
          <Button 
            fullWidth 
            sx={{ color: '#94a3b8', textTransform: 'none' }}
          >
            Enter Code Manually
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}