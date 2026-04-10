'use client';

import { useState } from 'react';

const ROOMS = [
    { id: 'A101', name: 'Computer Lab 1',    status: 'available' },
    { id: 'A102', name: 'Computer Lab 2',    status: 'occupied'  },
    { id: 'C201', name: 'Lecture Hall',       status: 'available' },
    { id: 'D101', name: 'Engineering Lab',    status: 'occupied'  },
    { id: 'F001', name: 'Library Study Room', status: 'available' },
];

function statusColor(s) { return s === 'available' ? '#22c55e' : '#ef4444'; }
function statusLabel(s) { return s === 'available' ? 'Available' : 'Occupied'; }

export default function RoomStatusPanel() {
    const [open, setOpen] = useState(false);

    return (
        <div style={{
            background: 'rgba(15,23,42,0.75)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            overflow: 'hidden',
        }}>
            {/* Header */}
            <div
                onClick={() => setOpen(o => !o)}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', cursor: 'pointer',
                    borderBottom: open ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                        width: 24, height: 24, borderRadius: 7,
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, flexShrink: 0,
                    }}>🏫</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9' }}>Room Status</span>
                    <span style={{
                        fontSize: 10, fontWeight: 700, color: '#fbbf24',
                        background: 'rgba(251,191,36,0.15)',
                        border: '1px solid rgba(251,191,36,0.3)',
                        borderRadius: 20, padding: '1px 8px',
                    }}>
                        Staff
                    </span>
                </div>
                <span style={{
                    fontSize: 11, color: 'rgba(255,255,255,0.4)',
                    display: 'inline-block', transition: 'transform 0.2s',
                    transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
                }}>
                    ▾
                </span>
            </div>

            {open && (
                <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
                    {ROOMS.map(r => (
                        <div key={r.id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '8px 10px', borderRadius: 10,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.07)',
                        }}>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>{r.name}</div>
                                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{r.id}</div>
                            </div>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '3px 9px', borderRadius: 20,
                                background: `${statusColor(r.status)}20`,
                                border: `1px solid ${statusColor(r.status)}50`,
                            }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor(r.status), flexShrink: 0 }} />
                                <span style={{ fontSize: 10, fontWeight: 700, color: statusColor(r.status) }}>
                                    {statusLabel(r.status)}
                                </span>
                            </div>
                        </div>
                    ))}

                    <div style={{
                        marginTop: 2, padding: '7px 10px', borderRadius: 8,
                        background: 'rgba(251,191,36,0.08)',
                        border: '1px dashed rgba(251,191,36,0.3)',
                        fontSize: 11, color: '#fbbf24', fontWeight: 600, textAlign: 'center',
                    }}>
                        🚧 Live timetable data coming soon
                    </div>
                </div>
            )}
        </div>
    );
}