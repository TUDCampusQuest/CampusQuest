'use client';

import { useState } from 'react';

// Placeholder room data replace with real timetable JSON once connected through csv or whatever we use to connect it later
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
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            overflow: 'hidden',
        }}>
            {/* Header — tap to expand/collapse */}
            <div
                onClick={() => setOpen(o => !o)}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '11px 14px', cursor: 'pointer',
                    borderBottom: open ? '1px solid rgba(226,232,240,0.6)' : 'none',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{
                        width: 22, height: 22, borderRadius: 6,
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, color: '#fff', flexShrink: 0,
                    }}>🏫</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#1e293b' }}>Room Status</span>
                    <span style={{
                        fontSize: 10, fontWeight: 700, color: '#f59e0b',
                        background: '#fffbeb', border: '1px solid #fde68a',
                        borderRadius: 20, padding: '1px 7px',
                    }}>
                        Staff
                    </span>
                </div>
                <span style={{
                    fontSize: 11, color: '#94a3b8',
                    display: 'inline-block', transition: 'transform 0.2s',
                    transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
                }}>
                    ▾
                </span>
            </div>

            {/* Room list */}
            {open && (
                <div style={{
                    padding: '8px 10px',
                    display: 'flex', flexDirection: 'column', gap: 4,
                    maxHeight: 200, overflowY: 'auto',
                }}>
                    {ROOMS.map(r => (
                        <div key={r.id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '7px 10px', borderRadius: 9,
                            background: 'rgba(248,250,252,0.8)',
                            border: '1px solid rgba(226,232,240,0.7)',
                        }}>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{r.name}</div>
                                <div style={{ fontSize: 10, color: '#94a3b8' }}>{r.id}</div>
                            </div>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '3px 9px', borderRadius: 20,
                                background: `${statusColor(r.status)}18`,
                                border: `1px solid ${statusColor(r.status)}44`,
                            }}>
                                <div style={{
                                    width: 6, height: 6, borderRadius: '50%',
                                    background: statusColor(r.status), flexShrink: 0,
                                }} />
                                <span style={{ fontSize: 10, fontWeight: 700, color: statusColor(r.status) }}>
                                    {statusLabel(r.status)}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Placeholder note */}
                    <div style={{
                        marginTop: 2, padding: '6px 10px', borderRadius: 8,
                        background: '#fffbeb', border: '1px dashed #fde68a',
                        fontSize: 11, color: '#92400e', fontWeight: 600, textAlign: 'center',
                    }}>
                        🚧 Live timetable data coming soon
                    </div>
                </div>
            )}
        </div>
    );
}