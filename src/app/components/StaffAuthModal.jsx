'use client';
// Staff login modal with email/password fields, focus ring styles, countdown on auth failure, and portal rendering.
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, Stack } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CloseIcon from '@mui/icons-material/Close';

export default function StaffAuthModal({ open, onClose, onSuccess }) {
    const [email,     setEmail]     = useState('');
    const [password,  setPassword]  = useState('');
    const [showPass,  setShowPass]  = useState(false);
    const [error,     setError]     = useState('');
    const [loading,   setLoading]   = useState(false);
    const [succeeded, setSucceeded] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [focusedField, setFocusedField] = useState(null);
    const [mounted, setMounted] = useState(false);
    const emailRef = useRef(null);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (open) {
            setEmail(''); setPassword(''); setError('');
            setLoading(false); setSucceeded(false); setCountdown(null);
            setTimeout(() => emailRef.current?.focus(), 180);
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handler = e => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    useEffect(() => {
        if (countdown === null) return;
        if (countdown === 0) { onClose(); return; }
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown, onClose]);

    const handleSubmit = async () => {
        if (!email.trim() || !password) { setError('Please enter both email and password.'); return; }
        setLoading(true); setError('');
        try {
            const res  = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), password }),
            });
            const data = await res.json();
            if (data.ok) {
                setSucceeded(true);
                sessionStorage.setItem('cq_staff', 'true');
                setTimeout(() => { onSuccess(); onClose(); }, 900);
            } else if (res.status === 401) {
                setError('You are not registered as a staff member.');
                setLoading(false);
                setCountdown(5);
            } else {
                setError(data.error ?? 'Something went wrong.');
                setLoading(false);
            }
        } catch {
            setError('Network error — please try again.');
            setLoading(false);
        }
    };

    const inputStyle = (field) => ({
        width: '100%',
        padding: field === 'password' ? '14px 46px 14px 16px' : '14px 16px',
        borderRadius: 12,
        fontSize: 15,
        border: focusedField === field
            ? '1.5px solid rgba(27,163,156,0.6)'
            : '1.5px solid rgba(255,255,255,0.1)',
        outline: 'none',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        background: focusedField === field
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(255,255,255,0.04)',
        color: '#fff',
        transition: 'all 0.18s ease',
        boxShadow: focusedField === field
            ? '0 0 0 4px rgba(27,163,156,0.12)'
            : 'none',
    });

    const modalContent = (
        <AnimatePresence>
            {open && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        zIndex: 2000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 16,
                        boxSizing: 'border-box',
                    }}
                >
                    {/* Backdrop */}
                    <motion.div
                        key="auth-backdrop"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={countdown !== null ? undefined : onClose}
                        style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(10,15,28,0.55)',
                            backdropFilter: 'blur(14px) saturate(160%)',
                            WebkitBackdropFilter: 'blur(14px) saturate(160%)',
                        }}
                    />

                    {/* Modal panel */}
                    <motion.div
                        key="auth-modal"
                        initial={{ opacity: 0, scale: 0.92, y: 10 }}
                        animate={{ opacity: 1, scale: 1,    y: 0  }}
                        exit={{   opacity: 0, scale: 0.94, y: 6  }}
                        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                        style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: 500,
                            boxSizing: 'border-box',
                        }}
                    >
                        <Box sx={{
                            position: 'relative',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            background: 'rgba(15,23,42,0.75)',
                            backdropFilter: 'blur(40px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            boxShadow: `
                                0 24px 60px rgba(0,0,0,0.5),
                                0 2px 8px rgba(0,0,0,0.3),
                                inset 0 1px 0 rgba(255,255,255,0.08)
                            `,
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                top: -80, left: -80,
                                width: 260, height: 260,
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(27,163,156,0.35) 0%, rgba(27,163,156,0) 70%)',
                                pointerEvents: 'none',
                                filter: 'blur(20px)',
                            }} />

                            <Box sx={{ px: 4, pt: 4, pb: 3, position: 'relative' }}>
                                {countdown === null && (
                                    <Box onClick={onClose} sx={{
                                        position: 'absolute', top: 16, right: 16,
                                        width: 32, height: 32, borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: 'rgba(255,255,255,0.5)',
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        backdropFilter: 'blur(8px)',
                                        '&:hover': {
                                            bgcolor: 'rgba(255,255,255,0.12)',
                                            color: '#fff',
                                            transform: 'scale(1.05)',
                                        },
                                        transition: 'all 0.18s ease',
                                    }}>
                                        <CloseIcon sx={{ fontSize: 16 }} />
                                    </Box>
                                )}

                                <Box sx={{
                                    width: 56, height: 56, borderRadius: '16px',
                                    background: succeeded
                                        ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                                        : countdown !== null
                                            ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
                                            : 'linear-gradient(135deg, #1BA39C 0%, #0e6d68 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    mb: 2,
                                    boxShadow: succeeded
                                        ? '0 8px 24px rgba(34,197,94,0.35)'
                                        : countdown !== null
                                            ? '0 8px 24px rgba(239,68,68,0.35)'
                                            : '0 8px 24px rgba(27,163,156,0.4)',
                                    transition: 'all 0.3s',
                                }}>
                                    {succeeded
                                        ? <LockOpenIcon sx={{ color: '#fff', fontSize: 28 }} />
                                        : <LockIcon sx={{ color: '#fff', fontSize: 28 }} />}
                                </Box>

                                <Typography sx={{
                                    fontWeight: 700,
                                    fontSize: '1.65rem',
                                    color: '#fff',
                                    letterSpacing: '-0.02em',
                                    lineHeight: 1.15,
                                }}>
                                    {succeeded ? 'Welcome back' : countdown !== null ? 'Access Denied' : 'Staff Access'}
                                </Typography>
                                <Typography sx={{
                                    fontSize: 14,
                                    color: 'rgba(255,255,255,0.55)',
                                    mt: 0.5,
                                    fontWeight: 400,
                                }}>
                                    {succeeded
                                        ? 'Logging you in…'
                                        : countdown !== null
                                            ? `Returning to map in ${countdown}s…`
                                            : 'Campus Quest — TU Dublin'}
                                </Typography>
                            </Box>

                            {!succeeded && countdown === null && (
                                <Box sx={{
                                    height: 1,
                                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
                                    mx: 4,
                                }} />
                            )}

                            <Box sx={{ px: 4, pt: 3, pb: 4, position: 'relative' }}>
                                {countdown !== null && (
                                    <Box sx={{ py: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{
                                            width: 72, height: 72, borderRadius: '50%',
                                            background: 'rgba(239,68,68,0.12)',
                                            border: '2px solid rgba(239,68,68,0.4)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 28, fontWeight: 800, color: '#f87171',
                                            boxShadow: '0 0 24px rgba(239,68,68,0.25)',
                                        }}>
                                            {countdown}
                                        </Box>
                                        <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 1.6, maxWidth: 320 }}>
                                            You are not registered as a staff member.<br />
                                            You will be returned to the map shortly.
                                        </Typography>
                                    </Box>
                                )}

                                {succeeded && (
                                    <Box sx={{ py: 2, textAlign: 'center' }}>
                                        <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                                            Staff mode activated. Loading…
                                        </Typography>
                                    </Box>
                                )}

                                {!succeeded && countdown === null && (
                                    <Stack spacing={2.25}>
                                        <Box>
                                            <Typography sx={{
                                                fontSize: 11,
                                                fontWeight: 700,
                                                color: 'rgba(255,255,255,0.5)',
                                                mb: 1,
                                                letterSpacing: '0.08em',
                                                textTransform: 'uppercase',
                                            }}>Email</Typography>
                                            <input
                                                ref={emailRef}
                                                type="email"
                                                value={email}
                                                onChange={e => { setEmail(e.target.value); setError(''); }}
                                                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                                onFocus={() => setFocusedField('email')}
                                                onBlur={() => setFocusedField(null)}
                                                placeholder="staff@tudublin.ie"
                                                style={inputStyle('email')}
                                            />
                                        </Box>

                                        <Box>
                                            <Typography sx={{
                                                fontSize: 11,
                                                fontWeight: 700,
                                                color: 'rgba(255,255,255,0.5)',
                                                mb: 1,
                                                letterSpacing: '0.08em',
                                                textTransform: 'uppercase',
                                            }}>Password</Typography>
                                            <Box sx={{ position: 'relative' }}>
                                                <input
                                                    type={showPass ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={e => { setPassword(e.target.value); setError(''); }}
                                                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                                    onFocus={() => setFocusedField('password')}
                                                    onBlur={() => setFocusedField(null)}
                                                    placeholder="••••••••"
                                                    style={inputStyle('password')}
                                                />
                                                <Box onClick={() => setShowPass(s => !s)} sx={{
                                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                                    cursor: 'pointer',
                                                    color: 'rgba(255,255,255,0.45)',
                                                    display: 'flex', alignItems: 'center',
                                                    width: 28, height: 28, borderRadius: '8px',
                                                    justifyContent: 'center',
                                                    '&:hover': {
                                                        color: 'rgba(255,255,255,0.9)',
                                                        background: 'rgba(255,255,255,0.06)',
                                                    },
                                                    transition: 'all 0.15s',
                                                }}>
                                                    {showPass ? <VisibilityOffIcon sx={{ fontSize: 19 }} /> : <VisibilityIcon sx={{ fontSize: 19 }} />}
                                                </Box>
                                            </Box>
                                        </Box>

                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Box sx={{
                                                    px: 2, py: 1.25, borderRadius: '10px',
                                                    background: 'rgba(239,68,68,0.1)',
                                                    border: '1px solid rgba(239,68,68,0.25)',
                                                }}>
                                                    <Typography sx={{ fontSize: 13, color: '#fca5a5', fontWeight: 500 }}>
                                                        {error}
                                                    </Typography>
                                                </Box>
                                            </motion.div>
                                        )}

                                        <Box
                                            onClick={!loading ? handleSubmit : undefined}
                                            sx={{
                                                mt: 0.5, py: 1.75, borderRadius: '14px',
                                                background: loading
                                                    ? 'rgba(148,163,184,0.3)'
                                                    : 'linear-gradient(135deg, #1BA39C 0%, #0e6d68 100%)',
                                                color: '#fff',
                                                textAlign: 'center',
                                                fontWeight: 700,
                                                fontSize: 15,
                                                letterSpacing: '0.01em',
                                                cursor: loading ? 'not-allowed' : 'pointer',
                                                boxShadow: loading
                                                    ? 'none'
                                                    : '0 8px 24px rgba(27,163,156,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                                                transition: 'all 0.2s ease',
                                                userSelect: 'none',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                '&:hover': loading ? {} : {
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: '0 12px 28px rgba(27,163,156,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
                                                },
                                                '&:active': loading ? {} : {
                                                    transform: 'translateY(0px)',
                                                },
                                            }}
                                        >
                                            {loading ? 'Verifying…' : 'Sign In'}
                                        </Box>
                                    </Stack>
                                )}
                            </Box>
                        </Box>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    if (!mounted) return null;
    return createPortal(modalContent, document.body);
}