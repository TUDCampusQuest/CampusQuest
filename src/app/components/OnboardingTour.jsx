'use client';
// Multi-step onboarding walkthrough shown to first-time users before they reach the map.
import { useState } from 'react';
import GlassCard from './ui/GlassCard';
import { useTheme } from '../context/ThemeContext';
import styles from '../styles/OnboardingTour.module.css';

const STEPS = [
    { emoji: '🧭', title: 'Welcome to Campus Quest',  body: 'Navigate TU Dublin Blanchardstown indoors and outdoors.' },
    { emoji: '🔍', title: 'Find Your Way Around',     body: 'Search for rooms, buildings, and trails. Tap any building to explore.' },
    { emoji: '📍', title: 'Live Navigation',          body: 'We use your GPS to guide you step by step, indoors and out.' },
    { emoji: '✅', title: "You're all set!",          body: 'Tap Get Started to open the map and begin exploring.' },
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
    const inactiveDot = isDark ? 'rgba(255,255,255,0.2)' : '#CBD5E1';

    const dismiss = () => {
        localStorage.setItem('campusquest_onboarded', 'true');
        setStep(-1);
    };

    const handleNext = () => {
        if (isLast) dismiss();
        else setStep(s => s + 1);
    };

    return (
        <div className={styles.backdrop}>
            {!isLast && (
                <button onClick={dismiss} className={styles.skipBtn}>Skip</button>
            )}

            <GlassCard style={{ maxWidth: 340, width: '90%', padding: 28, textAlign: 'center', borderRadius: 24 }}>
                <div className={styles.emojiBox}>{emoji}</div>
                <div className={styles.title}>{title}</div>
                <div className={styles.body}>{body}</div>

                <div className={styles.dots}>
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={styles.dot}
                            style={{ background: i === step ? '#7C3AED' : inactiveDot }}
                        />
                    ))}
                </div>

                <button onClick={handleNext} className={styles.nextBtn}>
                    {isLast ? 'Get Started' : 'Next →'}
                </button>
            </GlassCard>
        </div>
    );
}
