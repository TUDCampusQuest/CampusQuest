'use client';

import { useEffect } from 'react';

export default function TrailCaptureOverlay({
                                                captureMode,
                                                setCaptureMode,
                                                capturedPoints,
                                                setCapturedPoints,
                                                onClose,
                                            }) {
    // adding some keyboard shortcuts so I don't have to click 'Undo' a million times
    useEffect(() => {
        const handleKeys = (e) => {
            // Ctrl+Z (or Cmd+Z) to pop the last point off the array
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                setCapturedPoints(prev => prev.slice(0, -1));
            }
            // hit Esc to just stop recording and get out of capture mode
            if (e.key === 'Escape') {
                setCaptureMode(false);
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [setCaptureMode, setCapturedPoints]);

    // this turns the array of points into a string that fits perfectly into my trailPaths.js file
    const copyToClipboard = () => {
        if (!capturedPoints || capturedPoints.length === 0) return;

        // mapping over the points to make it look like a standard JS array
        const output = `[\n${capturedPoints
            .map(p => `  [${p[0]}, ${p[1]}]`)
            .join(',\n')}\n]`;

        // standard clipboard API stuff
        navigator.clipboard.writeText(output)
            .then(() => alert(`Copied ${capturedPoints.length} points! Ready to paste into trailPaths.`))
            .catch(err => console.error('Clipboard failed me:', err));
    };

    return (
        <div style={{
            background: 'white', padding: 16, borderRadius: 12,
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)', border: '1px solid #ddd',
            display: 'flex', flexDirection: 'column', gap: 10
        }}>
            {/* simple header with a close button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: '#111' }}>Trail Designer</span>
                <button
                    onClick={onClose}
                    style={{ cursor: 'pointer', border: 'none', background: 'none', fontSize: 18, color: '#111' }}
                >
                    ×
                </button>
            </div>

            {/* the big toggle button for recording */}
            <button
                onClick={() => setCaptureMode(!captureMode)}
                style={{
                    padding: '12px', borderRadius: 8, cursor: 'pointer', fontWeight: 800,
                    border: '2px solid #FF7A00',
                    background: captureMode ? '#FF7A00' : '#fff',
                    color: captureMode ? '#fff' : '#FF7A00',
                }}
            >
                {captureMode ? '🟢 Recording: Click Map' : 'Start Recording'}
            </button>

            {/* small grid for the edit buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                    onClick={() => setCapturedPoints(prev => prev.slice(0, -1))}
                    disabled={capturedPoints.length === 0}
                    style={{ padding: '8px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                >
                    Undo Last
                </button>
                <button
                    onClick={() => { if(window.confirm('Wipe everything?')) setCapturedPoints([]); }}
                    disabled={capturedPoints.length === 0}
                    style={{ padding: '8px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'red' }}
                >
                    Clear All
                </button>
            </div>

            {/* the button that actually lets me export the data to my code */}
            <button
                onClick={copyToClipboard}
                disabled={!capturedPoints || capturedPoints.length === 0}
                style={{
                    padding: '12px', borderRadius: 8,
                    cursor: capturedPoints.length === 0 ? 'default' : 'pointer',
                    fontWeight: 800,
                    background: capturedPoints.length === 0 ? '#ccc' : '#1BA39C',
                    color: '#fff', border: 'none'
                }}
            >
                Copy {capturedPoints?.length || 0} Points
            </button>
        </div>
    );
}