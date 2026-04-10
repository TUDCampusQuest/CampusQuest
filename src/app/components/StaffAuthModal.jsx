'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence }      from 'framer-motion';
import { Box, Typography, Stack }       from '@mui/material';
import LockIcon          from '@mui/icons-material/Lock';
import LockOpenIcon      from '@mui/icons-material/LockOpen';
import VisibilityIcon    from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CloseIcon         from '@mui/icons-material/Close';

export default function StaffAuthModal({ open, onClose, onSuccess }) {
    const [email,     setEmail]     = useState('');
    const [password,  setPassword]  = useState('');
    const [showPass,  setShowPass]  = useState(false);
    const [error,     setError]     = useState('');
    const [loading,   setLoading]   = useState(false);
    const [succeeded, setSucceeded] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const emailRef = useRef(null);

    useEffect(() => {
        if (open) {
            setEmail(''); setPassword(''); setError('');
            setLoading(false); setSucceeded(false); setCountdown(null);
            setTimeout(() => emailRef.current?.focus(), 120);
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

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        key="auth-backdrop"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={countdown !== null ? undefined : onClose}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 2000,
                            background: 'rgba(15,23,42,0.6)',
                            backdropFilter: 'blur(4px)',
                        }}
                    />

                    <motion.div
                        key="auth-modal"
                        initial={{ opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1    }}
                        exit={{   opacity: 0, scale: 0.94 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        style={{
                            position: 'fixed',
                            top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 2001,
                            width: 'calc(100% - 40px)',
                            maxWidth: 400,
                            boxSizing: 'border-box',
                        }}
                    >
                        <Box sx={{ bgcolor: '#fff', borderRadius: '20px', boxShadow: '0 32px 80px rgba(0,0,0,0.25)', overflow: 'hidden' }}>

                            <Box sx={{
                                px: 3, pt: 3, pb: 2.5,
                                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                                position: 'relative',
                            }}>
                                {countdown === null && (
                                    <Box onClick={onClose} sx={{
                                        position: 'absolute', top: 14, right: 14,
                                        width: 28, height: 28, borderRadius: '8px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' },
                                        transition: 'all 0.15s',
                                    }}>
                                        <CloseIcon sx={{ fontSize: 16 }} />
                                    </Box>
                                )}

                                <Box sx={{
                                    width: 44, height: 44, borderRadius: '12px',
                                    bgcolor: succeeded ? '#22c55e' : countdown !== null ? '#ef4444' : '#1BA39C',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    mb: 1.5, transition: 'background 0.3s',
                                }}>
                                    {succeeded ? <LockOpenIcon sx={{ color: '#fff', fontSize: 22 }} /> : <LockIcon sx={{ color: '#fff', fontSize: 22 }} />}
                                </Box>

                                <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
                                    {succeeded ? 'Welcome back 👋' : countdown !== null ? 'Access Denied' : 'Staff Access'}
                                </Typography>
                                <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', mt: 0.25 }}>
                                    {succeeded ? 'Logging you in...' : countdown !== null ? `Returning to map in ${countdown}s...` : 'Campus Quest — TU Dublin'}
                                </Typography>
                            </Box>

                            <Box sx={{ px: 3, pt: 2.5, pb: 3 }}>
                                {countdown !== null && (
                                    <Box sx={{ py: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{
                                            width: 56, height: 56, borderRadius: '50%',
                                            bgcolor: '#fef2f2', border: '3px solid #fecaca',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 22, fontWeight: 900, color: '#dc2626',
                                        }}>
                                            {countdown}
                                        </Box>
                                        <Typography sx={{ fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 1.5 }}>
                                            You are not registered as a staff member.<br />
                                            You will be returned to the map shortly.
                                        </Typography>
                                    </Box>
                                )}

                                {succeeded && (
                                    <Box sx={{ py: 2, textAlign: 'center' }}>
                                        <Typography sx={{ fontSize: 13, color: '#64748b' }}>Staff mode activated. Loading...</Typography>
                                    </Box>
                                )}

                                {!succeeded && countdown === null && (
                                    <Stack spacing={1.5}>
                                        <Box>
                                            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#64748b', mb: 0.5, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Email</Typography>
                                            <input
                                                ref={emailRef}
                                                type="email"
                                                value={email}
                                                onChange={e => { setEmail(e.target.value); setError(''); }}
                                                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                                placeholder="staff@tudublin.ie"
                                                style={{
                                                    width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
                                                    border: '1.5px solid #e2e8f0', outline: 'none',
                                                    boxSizing: 'border-box', fontFamily: 'inherit',
                                                    background: '#f8fafc', color: '#0f172a', transition: 'border-color 0.15s',
                                                }}
                                                onFocus={e => e.target.style.borderColor = '#1BA39C'}
                                                onBlur={e  => e.target.style.borderColor = '#e2e8f0'}
                                            />
                                        </Box>

                                        <Box>
                                            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#64748b', mb: 0.5, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Password</Typography>
                                            <Box sx={{ position: 'relative' }}>
                                                <input
                                                    type={showPass ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={e => { setPassword(e.target.value); setError(''); }}
                                                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                                    placeholder="••••••••"
                                                    style={{
                                                        width: '100%', padding: '10px 40px 10px 14px', borderRadius: 10, fontSize: 14,
                                                        border: '1.5px solid #e2e8f0', outline: 'none',
                                                        boxSizing: 'border-box', fontFamily: 'inherit',
                                                        background: '#f8fafc', color: '#0f172a', transition: 'border-color 0.15s',
                                                    }}
                                                    onFocus={e => e.target.style.borderColor = '#1BA39C'}
                                                    onBlur={e  => e.target.style.borderColor = '#e2e8f0'}
                                                />
                                                <Box onClick={() => setShowPass(s => !s)} sx={{
                                                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                                    cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center',
                                                    '&:hover': { color: '#475569' },
                                                }}>
                                                    {showPass ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                                                </Box>
                                            </Box>
                                        </Box>

                                        {error && (
                                            <Box sx={{ px: 1.5, py: 1, borderRadius: '8px', bgcolor: '#fef2f2', border: '1px solid #fecaca' }}>
                                                <Typography sx={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>{error}</Typography>
                                            </Box>
                                        )}

                                        <Box
                                            onClick={!loading ? handleSubmit : undefined}
                                            sx={{
                                                mt: 0.5, py: 1.4, borderRadius: '12px',
                                                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #1BA39C 0%, #0e6d68 100%)',
                                                color: '#fff', textAlign: 'center', fontWeight: 800, fontSize: 14,
                                                cursor: loading ? 'not-allowed' : 'pointer',
                                                boxShadow: loading ? 'none' : '0 4px 14px rgba(27,163,156,0.4)',
                                                transition: 'all 0.18s', userSelect: 'none',
                                                '&:hover': loading ? {} : { transform: 'translateY(-1px)', boxShadow: '0 6px 18px rgba(27,163,156,0.45)' },
                                            }}
                                        >
                                            {loading ? 'Verifying...' : 'Sign In'}
                                        </Box>
                                    </Stack>
                                )}
                            </Box>
                        </Box>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}