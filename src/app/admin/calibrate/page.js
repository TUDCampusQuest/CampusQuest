'use client';

export default function CalibratePage() {
    return (
        <div style={{
            padding: 32,
            maxWidth: 640,
            margin: '0 auto',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: '#0f172a',
            lineHeight: 1.5,
        }}>
            <h2 style={{ marginTop: 0 }}>Floor plan calibration retired</h2>
            <p>
                Indoor maps now use real MazeMap vector data sourced from the
                public API. The PNG overlay calibration workflow has been
                replaced by <code>src/app/data/mazemap-buildings.js</code> and
                <code> src/app/data/mazemap-indoorRooms.js</code>.
            </p>
        </div>
    );
}
