'use client';
import { useState } from 'react';
import GlassCard from './ui/GlassCard';
import { useTheme } from '../context/ThemeContext';

const STEPS = [
    {
        emoji: '🧭',
        title: 'Welcome to Campus Quest',
        body: 'Navigate TU Dublin Blanchardstown indoors and outdoors.',
    },
    {
        emoji: '🔍',
        title: 'Find Your Way Around',
        body: 'Search for rooms, buildings, and trails. Tap any building to explore.',
    },
    {
        emoji: '📍',
        title: 'Live Navigation',
        body: 'We use your GPS to guide you step by step, indoors and out.',
    },
    {
        emoji: '✅',
        title: "You're all set!",
        body: 'Tap Get Started to open the map and begin exploring.',
    },
];

export default function OnboardingTour() {
    const { isDark } = useTheme();

    const [step, setStep] = useState(() => {
        if (typeof window !== 'undefined' &&
            localStorage.getItem('campusquest_onboarded') === 'true') {
            return -1;
        }
        return 0;
    });

    if (step === -1) return null;

    const isLast = step === STEPS.length - 1;
    const { emoji, title, body } = STEPS[step];

    const dismiss = () => {
        localStorage.setItem('campusquest_onboarded', 'true');
        setStep(-1);
    };

    const handleNext = () => {
        if (isLast) dismiss();
        else setStep(s => s + 1);
    };

    const inactiveDot = isDark ? 'rgba(255,255,255,0.2)' : '#CBD5E1';

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1200,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            {!isLast && (
                <button
                    onClick={dismiss}
                    style={{
                        position: 'absolute', top: 16, right: 16,
                        fontSize: 12, color: 'var(--text-secondary)',
                        cursor: 'pointer', background: 'none', border: 'none',
                        padding: '4px 8px',
                    }}
                >
                    Skip
                </button>
            )}

            <GlassCard style={{
                maxWidth: 340, width: '90%', padding: 28,
                textAlign: 'center', borderRadius: 24,
            }}>
                {/* Emoji */}
                <div style={{
                    width: 64, height: 64, background: 'var(--bg-card)',
                    borderRadius: 16, fontSize: 30,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                }}>
                    {emoji}
                </div>

                {/* Title */}
                <div style={{
                    fontSize: 20, fontWeight: 800,
                    color: 'var(--text-primary)', marginBottom: 8,
                }}>
                    {title}
                </div>

                {/* Body */}
                <div style={{
                    fontSize: 14, color: 'var(--text-secondary)',
                    lineHeight: 1.5, marginBottom: 24,
                }}>
                    {body}
                </div>

                {/* Progress dots */}
                <div style={{
                    display: 'flex', flexDirection: 'row', gap: 8,
                    justifyContent: 'center', marginBottom: 24,
                }}>
                    {STEPS.map((_, i) => (
                        <div key={i} style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: i === step ? '#1BA39C' : inactiveDot,
                        }} />
                    ))}
                </div>

                {/* Primary button */}
                <button
                    onClick={handleNext}
                    style={{
                        width: '100%', height: 48, borderRadius: 12,
                        border: 'none', background: '#1BA39C',
                        color: '#fff', fontWeight: 700, fontSize: 15,
                        cursor: 'pointer',
                    }}
                >
                    {isLast ? 'Get Started' : 'Next →'}
                </button>
            </GlassCard>
        </div>
    );
}
