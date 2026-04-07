"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { Box, IconButton, Stack, Paper, Typography, Tooltip } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

import SearchIcon        from "@mui/icons-material/Search";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import InfoOutlinedIcon  from "@mui/icons-material/InfoOutlined";
import RouteIcon         from "@mui/icons-material/Route";
import AddIcon           from "@mui/icons-material/Add";
import RemoveIcon        from "@mui/icons-material/Remove";
import MyLocationIcon    from "@mui/icons-material/MyLocation";
import ViewInArIcon      from "@mui/icons-material/ViewInAr";
import LockIcon          from "@mui/icons-material/Lock";
import LockOpenIcon      from "@mui/icons-material/LockOpen";
import CloseIcon         from "@mui/icons-material/Close";
import NavigationIcon    from "@mui/icons-material/Navigation";

import { locations } from "./data/locations";
import NavHUD from "./components/NavHUD";
import SearchDrawer  from "./components/SearchDrawer";
import LocationSheet from "./components/LocationSheet";

const MapView = dynamic(() => import("./components/MapView"), {
    ssr: false,
    loading: () => <Box sx={{ height: "100dvh", width: "100vw", bgcolor: "#f1f5f9" }} />,
});

// ── Admin Login Modal ─────────────────────────────────────────────────────────
function AdminLoginModal({ onSuccess, onClose }) {
    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [error, setError]       = useState("");
    const [loading, setLoading]   = useState(false);
    const [shake, setShake]       = useState(false);
    const emailRef                = useRef(null);

    useEffect(() => { emailRef.current?.focus(); }, []);

    const handleSubmit = async (e) => {
        e?.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res  = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password }),
            });
            const data = await res.json();
            if (data.ok) {
                onSuccess();
            } else {
                setShake(true);
                setError(data.error ?? "Incorrect email or password.");
                setTimeout(() => setShake(false), 500);
            }
        } catch {
            setError("Network error — please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                position: "fixed", inset: 0, zIndex: 2000,
                bgcolor: "rgba(10,15,30,0.72)",
                backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                p: 2,
            }}
            onClick={onClose}
        >
            <Box
                onClick={e => e.stopPropagation()}
                sx={{
                    width: "100%", maxWidth: 380,
                    bgcolor: "#fff",
                    borderRadius: "28px",
                    overflow: "hidden",
                    boxShadow: "0 40px 100px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05)",
                    animation: shake ? "adminShake 0.45s ease" : "adminSlideUp 0.35s cubic-bezier(0.34,1.4,0.64,1)",
                }}
            >
                {/* Top accent bar */}
                <Box sx={{
                    height: 5,
                    background: "linear-gradient(90deg, #1BA39C 0%, #0e6d68 50%, #14b8a6 100%)",
                }} />

                <Box sx={{ p: { xs: 3, sm: 3.5 } }}>
                    {/* Icon + heading */}
                    <Stack alignItems="center" spacing={1.5} sx={{ mb: 3.5 }}>
                        <Box sx={{
                            width: 56, height: 56, borderRadius: "16px",
                            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 8px 24px rgba(15,23,42,0.25)",
                        }}>
                            <LockIcon sx={{ color: "#1BA39C", fontSize: 26 }} />
                        </Box>
                        <Box sx={{ textAlign: "center" }}>
                            <Typography sx={{ fontWeight: 900, fontSize: "1.2rem", color: "#0f172a", letterSpacing: "-0.3px" }}>
                                Staff Portal
                            </Typography>
                            <Typography sx={{ fontSize: 13, color: "#64748b", mt: 0.25 }}>
                                Campus Quest · TU Dublin
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Form */}
                    <Stack spacing={2}>
                        {/* Email */}
                        <Box>
                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#374151", mb: 0.75, letterSpacing: "0.02em" }}>
                                EMAIL ADDRESS
                            </Typography>
                            <Box
                                component="input"
                                ref={emailRef}
                                type="email"
                                placeholder="staff@tudublin.ie"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setError(""); }}
                                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                                sx={{
                                    width: "100%", height: 48,
                                    px: 2, borderRadius: "12px",
                                    border: error ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
                                    bgcolor: "#f8fafc", fontSize: 14, color: "#0f172a",
                                    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                                    transition: "border-color 0.15s, background 0.15s",
                                    "&:focus": { borderColor: "#1BA39C", bgcolor: "#f0fdfa" },
                                    "&::placeholder": { color: "#94a3b8" },
                                }}
                            />
                        </Box>

                        {/* Password */}
                        <Box>
                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#374151", mb: 0.75, letterSpacing: "0.02em" }}>
                                PASSWORD
                            </Typography>
                            <Box sx={{ position: "relative" }}>
                                <Box
                                    component="input"
                                    type={showPass ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => { setPassword(e.target.value); setError(""); }}
                                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                                    sx={{
                                        width: "100%", height: 48,
                                        px: 2, pr: "56px", borderRadius: "12px",
                                        border: error ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
                                        bgcolor: "#f8fafc", fontSize: 14, color: "#0f172a",
                                        outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                                        transition: "border-color 0.15s, background 0.15s",
                                        "&:focus": { borderColor: "#1BA39C", bgcolor: "#f0fdfa" },
                                        "&::placeholder": { color: "#94a3b8" },
                                    }}
                                />
                                <Box
                                    onClick={() => setShowPass(v => !v)}
                                    sx={{
                                        position: "absolute", right: 14, top: "50%",
                                        transform: "translateY(-50%)",
                                        cursor: "pointer", color: "#94a3b8",
                                        fontSize: 12, fontWeight: 700,
                                        userSelect: "none",
                                        "&:hover": { color: "#475569" },
                                        transition: "color 0.15s",
                                    }}
                                >
                                    {showPass ? "Hide" : "Show"}
                                </Box>
                            </Box>
                        </Box>

                        {/* Error */}
                        {error && (
                            <Box sx={{
                                display: "flex", alignItems: "center", gap: 1,
                                px: 2, py: 1.25, borderRadius: "10px",
                                bgcolor: "#fef2f2", border: "1px solid #fecaca",
                            }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#ef4444", flexShrink: 0 }} />
                                <Typography sx={{ fontSize: 13, color: "#dc2626", fontWeight: 600 }}>
                                    {error}
                                </Typography>
                            </Box>
                        )}

                        {/* Submit */}
                        <Box
                            onClick={!loading ? handleSubmit : undefined}
                            sx={{
                                height: 50, borderRadius: "14px",
                                background: loading ? "#94a3b8" : "linear-gradient(135deg, #1BA39C 0%, #0e6d68 100%)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: loading ? "not-allowed" : "pointer",
                                boxShadow: loading ? "none" : "0 6px 20px rgba(27,163,156,0.4)",
                                transition: "all 0.2s", mt: 0.5,
                                "&:hover": !loading ? {
                                    opacity: 0.92,
                                    transform: "translateY(-1px)",
                                    boxShadow: "0 8px 24px rgba(27,163,156,0.45)",
                                } : {},
                            }}
                        >
                            {loading ? (
                                <Box sx={{
                                    width: 20, height: 20, borderRadius: "50%",
                                    border: "2.5px solid rgba(255,255,255,0.3)",
                                    borderTopColor: "#fff",
                                    animation: "adminSpin 0.7s linear infinite",
                                }} />
                            ) : (
                                <Typography sx={{ fontWeight: 800, fontSize: 15, color: "#fff", letterSpacing: "0.01em" }}>
                                    Sign In
                                </Typography>
                            )}
                        </Box>

                        {/* Cancel */}
                        <Box onClick={onClose} sx={{ textAlign: "center", cursor: "pointer", py: 0.5 }}>
                            <Typography sx={{
                                fontSize: 13, color: "#94a3b8", fontWeight: 600,
                                "&:hover": { color: "#475569" }, transition: "color 0.15s",
                            }}>
                                Cancel
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
            </Box>

            <style>{`
                @keyframes adminSlideUp {
                    from { transform: translateY(32px) scale(0.97); opacity: 0; }
                    to   { transform: translateY(0)    scale(1);    opacity: 1; }
                }
                @keyframes adminShake {
                    0%,100% { transform: translateX(0); }
                    18%     { transform: translateX(-9px); }
                    36%     { transform: translateX(9px); }
                    54%     { transform: translateX(-6px); }
                    72%     { transform: translateX(6px); }
                }
                @keyframes adminSpin { to { transform: rotate(360deg); } }
            `}</style>
        </Box>
    );
}

// ── Sidebar button ────────────────────────────────────────────────────────────
function SideBtn({ icon, label, onClick, active, tooltip }) {
    return (
        <Tooltip title={tooltip} placement="left" arrow>
            <Box onClick={onClick} sx={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: "3px", py: "9px", px: "6px",
                cursor: "pointer",
                color: active ? "#1BA39C" : "#64748b",
                bgcolor: active ? "rgba(27,163,156,0.08)" : "transparent",
                borderRadius: "10px", transition: "all 0.16s",
                "&:hover": { bgcolor: "rgba(27,163,156,0.1)", color: "#1BA39C" },
                userSelect: "none",
            }}>
                {icon}
                <Typography sx={{ fontSize: 9, fontWeight: 700, lineHeight: 1, letterSpacing: "0.03em", color: "inherit" }}>
                    {label}
                </Typography>
            </Box>
        </Tooltip>
    );
}

function SideDivider() {
    return <Box sx={{ height: "1px", bgcolor: "#f1f5f9", mx: "8px" }} />;
}

// ── Main Page (inner — needs useSearchParams) ─────────────────────────────────
function HomeInner() {
    const router       = useRouter();
    const searchParams = useSearchParams();
    const mapRef       = useRef(null);
    const [isMounted, setIsMounted]           = useState(false);
    const [searchOpen, setSearchOpen]         = useState(false);
    const [query, setQuery]                   = useState("");
    const [sheetLocation, setSheetLocation]   = useState(null);  // drives LocationSheet
    const [navTarget, setNavTarget]           = useState(null);
    const [isNavigating, setIsNavigating]     = useState(false);
    const [gpsLocation, setGpsLocation]       = useState(null);
    const [isAdmin, setIsAdmin]               = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const [viewState, setViewState] = useState({
        longitude: -6.37824, latitude: 53.405292,
        zoom: 16, pitch: 0, bearing: 0,
    });

    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== "undefined" && sessionStorage.getItem("cq_admin") === "true") {
            setIsAdmin(true);
        }
    }, []);

    // Handle ?location=ID from QR scan redirect
    useEffect(() => {
        const locId = searchParams.get("location");
        if (!locId) return;
        const found = locations.find(l => l.id.toUpperCase() === locId.toUpperCase());
        if (found) setSheetLocation(found);
    }, [searchParams]);

    const handleAdminSuccess = () => {
        setIsAdmin(true);
        setShowLoginModal(false);
        sessionStorage.setItem("cq_admin", "true");
    };

    const handleAdminToggle = () => {
        if (isAdmin) {
            setIsAdmin(false);
            sessionStorage.removeItem("cq_admin");
        } else {
            setShowLoginModal(true);
        }
    };

    useEffect(() => {
        if (!navigator.geolocation) return;
        const id = navigator.geolocation.watchPosition(
            p => setGpsLocation({ lng: p.coords.longitude, lat: p.coords.latitude }),
            () => {},
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
        return () => navigator.geolocation.clearWatch(id);
    }, []);

    const fetchTrails = useCallback(async () => {
        try {
            const res  = await fetch("/api/trails", { cache: "no-store" });
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        } catch { return []; }
    }, []);

    useEffect(() => {
        fetchTrails();
        window.addEventListener("focus", fetchTrails);
        return () => window.removeEventListener("focus", fetchTrails);
    }, [fetchTrails]);

    // Open sheet from search or map pin
    const handleSelectLocation = (loc) => {
        setSheetLocation(loc);
        setSearchOpen(false);
        setQuery("");
    };

    // Navigate button inside the sheet
    const handleNavigateFromSheet = (loc) => {
        setNavTarget(loc);
        setIsNavigating(false);
        setSheetLocation(null);
    };

    const handleZoomIn   = () => setViewState(v => ({ ...v, zoom: Math.min(v.zoom + 1, 20) }));
    const handleZoomOut  = () => setViewState(v => ({ ...v, zoom: Math.max(v.zoom - 1, 0) }));
    const handleToggle3D = () => setViewState(p => ({ ...p, pitch: p.pitch === 0 ? 60 : 0, duration: 900 }));
    const handleRecenter = () => {
        const target = gpsLocation
            ? { longitude: gpsLocation.lng, latitude: gpsLocation.lat, zoom: 18 }
            : { longitude: -6.37824, latitude: 53.405292, zoom: 16 };
        setViewState(p => ({ ...p, ...target, pitch: 0, duration: 1200 }));
    };

    const filtered = (Array.isArray(locations) ? locations : []).filter(l =>
        l.name?.toLowerCase().includes(query.toLowerCase()) ||
        l.id?.toLowerCase().includes(query.toLowerCase())
    );

    if (!isMounted) return null;

    return (
        <Box sx={{ height: "100dvh", width: "100vw", display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {showLoginModal && (
                <AdminLoginModal
                    onSuccess={handleAdminSuccess}
                    onClose={() => setShowLoginModal(false)}
                />
            )}

            {/* ══ HEADER ══════════════════════════════════════════════════════ */}
            <Box sx={{
                flexShrink: 0, height: { xs: 56, sm: 60 },
                bgcolor: "rgba(255,255,255,0.97)", backdropFilter: "blur(10px)",
                display: "flex", alignItems: "center",
                px: { xs: 1.5, sm: 2.5 },
                borderBottom: "1px solid #e2e8f0", zIndex: 1100,
            }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{
                        width: 30, height: 30, borderRadius: "8px",
                        background: "linear-gradient(135deg, #1BA39C 0%, #0e6d68 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 15, flexShrink: 0,
                    }}>🧭</Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e293b", fontSize: { xs: "1rem", sm: "1.15rem" } }}>
                        Campus Quest
                    </Typography>
                    {isAdmin && (
                        <Box sx={{
                            px: 1, py: 0.3, borderRadius: "20px",
                            background: "linear-gradient(135deg, #1BA39C, #0e6d68)",
                            color: "#fff", fontSize: 10, fontWeight: 800,
                            letterSpacing: "0.08em", textTransform: "uppercase",
                            lineHeight: 1.6, flexShrink: 0,
                            animation: "badgePop 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                            boxShadow: "0 2px 8px rgba(27,163,156,0.4)",
                        }}>
                            Staff
                        </Box>
                    )}
                </Stack>

                <Stack direction="row" spacing={0.75} alignItems="center">
                    <Tooltip title="App info" placement="bottom">
                        <Box onClick={() => router.push("/info")} sx={{
                            display: "flex", alignItems: "center", gap: "5px",
                            px: 1.5, py: 0.6, borderRadius: "20px",
                            border: "1px solid #e2e8f0", bgcolor: "#f8fafc",
                            cursor: "pointer", transition: "all 0.15s",
                            "&:hover": { bgcolor: "#f0fdfa", borderColor: "#1BA39C" },
                        }}>
                            <InfoOutlinedIcon sx={{ fontSize: 15, color: "#64748b" }} />
                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#475569", display: { xs: "none", sm: "block" } }}>Info</Typography>
                        </Box>
                    </Tooltip>

                    <Tooltip title="Campus trails" placement="bottom">
                        <Box onClick={() => router.push("/trails")} sx={{
                            display: "flex", alignItems: "center", gap: "5px",
                            px: 1.5, py: 0.6, borderRadius: "20px",
                            border: "1px solid #e2e8f0", bgcolor: "#f8fafc",
                            cursor: "pointer", transition: "all 0.15s",
                            "&:hover": { bgcolor: "#f0fdfa", borderColor: "#1BA39C" },
                        }}>
                            <RouteIcon sx={{ fontSize: 15, color: "#64748b" }} />
                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#475569", display: { xs: "none", sm: "block" } }}>Trails</Typography>
                        </Box>
                    </Tooltip>

                    {/* Staff login / logout */}
                    <Tooltip title={isAdmin ? "Sign out of staff mode" : "Staff sign in"} placement="bottom">
                        <Box onClick={handleAdminToggle} sx={{
                            display: "flex", alignItems: "center", gap: "5px",
                            px: 1.5, py: 0.6, borderRadius: "20px",
                            border: isAdmin ? "1.5px solid #1BA39C" : "1px solid #e2e8f0",
                            bgcolor: isAdmin ? "#f0fdfa" : "#f8fafc",
                            cursor: "pointer", transition: "all 0.2s",
                            "&:hover": { bgcolor: "#f0fdfa", borderColor: "#1BA39C" },
                        }}>
                            {isAdmin
                                ? <LockOpenIcon sx={{ fontSize: 15, color: "#1BA39C" }} />
                                : <LockIcon    sx={{ fontSize: 15, color: "#94a3b8" }} />
                            }
                            <Typography sx={{
                                fontSize: 12, fontWeight: 700,
                                color: isAdmin ? "#1BA39C" : "#94a3b8",
                                display: { xs: "none", sm: "block" },
                                transition: "color 0.2s",
                            }}>
                                {isAdmin ? "Sign Out" : "Staff"}
                            </Typography>
                        </Box>
                    </Tooltip>
                </Stack>
            </Box>

            {/* ══ MAP ═════════════════════════════════════════════════════════ */}
            <Box sx={{ flex: 1, position: "relative", minHeight: 0 }}>
                <MapView
                    viewState={viewState}
                    onMove={evt => setViewState(evt.viewState)}
                    onMapLoad={map => (mapRef.current = map)}
                    navTarget={navTarget}
                    isNavigating={isNavigating}
                    onTrailSaved={fetchTrails}
                    isAdmin={isAdmin}
                    onLocationSelect={handleSelectLocation}
                />

                <Paper elevation={3} sx={{
                    position: "absolute",
                    right: { xs: 10, sm: 14 }, top: { xs: 12, sm: 16 },
                    zIndex: 10, borderRadius: "14px", overflow: "hidden",
                    border: "1px solid #e2e8f0", width: 52,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}>
                    <SideBtn icon={<ViewInArIcon   sx={{ fontSize: 18 }} />} label="3D"  onClick={handleToggle3D}  active={viewState.pitch > 0} tooltip={viewState.pitch > 0 ? "Switch to 2D" : "Switch to 3D"} />
                    <SideDivider />
                    <SideBtn icon={<AddIcon        sx={{ fontSize: 18 }} />} label="In"  onClick={handleZoomIn}   tooltip="Zoom in" />
                    <SideBtn icon={<RemoveIcon     sx={{ fontSize: 18 }} />} label="Out" onClick={handleZoomOut}  tooltip="Zoom out" />
                    <SideDivider />
                    <SideBtn icon={<MyLocationIcon sx={{ fontSize: 18 }} />} label="Me"  onClick={handleRecenter} active={!!gpsLocation} tooltip={gpsLocation ? "Go to my location" : "Recenter on campus"} />
                </Paper>

                {isNavigating && navTarget && (
                    <NavHUD navTarget={navTarget} onExit={() => { setNavTarget(null); setIsNavigating(false); }} />
                )}

                {/* Location sheet — shown over the map */}
                <LocationSheet
                    location={sheetLocation}
                    onClose={() => setSheetLocation(null)}
                    onNavigate={handleNavigateFromSheet}
                />

                {/* NavBottomCard — only shown after Navigate is pressed from sheet */}
                {navTarget && !isNavigating && (
                    <Box sx={{
                        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 15,
                        bgcolor: "#fff", borderRadius: "20px 20px 0 0",
                        boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
                        px: { xs: 2.5, sm: 3 }, pt: 1,
                        pb: { xs: "max(24px, env(safe-area-inset-bottom))", sm: "28px" },
                        animation: "slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)",
                    }}>
                        <Box sx={{ width: 40, height: 4, bgcolor: "#e2e8f0", borderRadius: 99, mx: "auto", mb: 2.5 }} />
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                            <Box>
                                <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#1BA39C", letterSpacing: "0.08em", textTransform: "uppercase", mb: 0.5 }}>
                                    📍 {navTarget.id}
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a", lineHeight: 1.2 }}>
                                    {navTarget.name}
                                </Typography>
                            </Box>
                            <IconButton size="small" onClick={() => setNavTarget(null)} sx={{ bgcolor: "#f1f5f9", ml: 1.5, flexShrink: 0 }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                        <Stack direction="row" spacing={1.5}>
                            <Box onClick={() => setNavTarget(null)} sx={{
                                flex: 1, py: 1.75, borderRadius: "12px",
                                border: "1.5px solid #e2e8f0", bgcolor: "#fff",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", "&:hover": { bgcolor: "#f8fafc" },
                            }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Cancel</Typography>
                            </Box>
                            <Box onClick={() => setIsNavigating(true)} sx={{
                                flex: 2, py: 1.75, borderRadius: "12px",
                                background: "linear-gradient(135deg, #1BA39C 0%, #15857f 100%)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                gap: 1, cursor: "pointer",
                                boxShadow: "0 4px 16px rgba(27,163,156,0.4)",
                                "&:hover": { opacity: 0.93 },
                            }}>
                                <NavigationIcon sx={{ color: "#fff", fontSize: 18 }} />
                                <Typography sx={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>Start Navigation</Typography>
                            </Box>
                        </Stack>
                    </Box>
                )}
            </Box>

            {/* ══ BOTTOM BAR ══════════════════════════════════════════════════ */}
            {!isNavigating && (
                <Box sx={{
                    flexShrink: 0, display: "flex", alignItems: "center", gap: 1.5,
                    px: { xs: 2, sm: 3 }, pt: 1.5,
                    pb: { xs: "max(16px, env(safe-area-inset-bottom))", sm: "20px" },
                    bgcolor: "rgba(255,255,255,0.97)", borderTop: "1px solid #e2e8f0", zIndex: 1100,
                }}>
                    <Paper elevation={0} onClick={() => setSearchOpen(true)} sx={{
                        flex: 1, minWidth: 0, borderRadius: "14px",
                        display: "flex", alignItems: "center", px: 2,
                        height: { xs: 50, sm: 54 }, cursor: "pointer",
                        bgcolor: "#f8fafc", border: "1.5px solid #e2e8f0",
                        transition: "all 0.15s",
                        "&:hover": { borderColor: "#1BA39C", bgcolor: "#f0fdfa" },
                    }}>
                        <SearchIcon sx={{ color: "#94a3b8", mr: 1.5, flexShrink: 0, fontSize: 20 }} />
                        <Typography noWrap sx={{ color: "#94a3b8", flex: 1, fontSize: { xs: "0.85rem", sm: "0.9rem" }, fontWeight: 500 }}>
                            Search buildings & locations...
                        </Typography>
                    </Paper>

                    <Tooltip title="Scan QR code" placement="top">
                        <IconButton onClick={() => router.push("/scan")} sx={{
                            bgcolor: "#1BA39C", color: "#fff",
                            width: { xs: 50, sm: 54 }, height: { xs: 50, sm: 54 },
                            borderRadius: "14px", flexShrink: 0,
                            boxShadow: "0 4px 14px rgba(27,163,156,0.4)",
                            "&:hover": { bgcolor: "#15857f", transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(27,163,156,0.45)" },
                            transition: "all 0.18s",
                        }}>
                            <QrCodeScannerIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}

            <SearchDrawer
                open={searchOpen}
                onClose={() => { setSearchOpen(false); setQuery(""); }}
                query={query} onQueryChange={setQuery}
                results={filtered} onSelect={handleSelectLocation}
            />

            <style>{`
                @keyframes slideUp  { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
                @keyframes hudPulse { 0%,100% { box-shadow:0 0 0 3px rgba(27,163,156,0.3); } 50% { box-shadow:0 0 0 7px rgba(27,163,156,0.06); } }
                @keyframes badgePop { from { transform:scale(0.5); opacity:0; } to { transform:scale(1); opacity:1; } }
            `}</style>
        </Box>
    );
}

export default function Home() {
    return (
        <Suspense fallback={null}>
            <HomeInner />
        </Suspense>
    );
}