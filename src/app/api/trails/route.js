export const dynamic = "force-dynamic";

import { getS3Data, putS3Data } from "@/lib/s3";

// -----------------------------------------------------------------------------
// GET /api/trails
// Bridge between S3 and the home page.
//
// 1. Fetches trailsPoints.json from the S3 bucket
// 2. Parses and returns the JSON array
// 3. Falls back to [] if the file is missing or empty so the UI never crashes
// 4. Sets no-cache headers so the browser always gets the latest trail list
//    after a new trail is saved
// -----------------------------------------------------------------------------
export async function GET() {
    try {
        const data = await getS3Data("trailsPoints.json");

        // Fallback: file missing, empty, or S3 unreachable
        if (!data) {
            return new Response(JSON.stringify([]), {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    // Prevent the browser and CDN from caching a stale trail list
                    "Cache-Control": "no-store, no-cache, must-revalidate",
                    "Pragma": "no-cache",
                },
            });
        }

        // Normalise: S3 file should be an array — if not, return empty fallback
        const trails = Array.isArray(data) ? data : [];

        return new Response(JSON.stringify(trails), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store, no-cache, must-revalidate",
                "Pragma": "no-cache",
            },
        });

    } catch (err) {
        console.error("GET /api/trails error:", err);
        // Return empty array rather than a 500 so the UI degrades gracefully
        return new Response(JSON.stringify([]), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store, no-cache, must-revalidate",
                "Pragma": "no-cache",
            },
        });
    }
}

// -----------------------------------------------------------------------------
// POST /api/trails
// Appends a new trail to trailsPoints.json in S3.
//
// Expected request body (JSON):
// {
//   id:          string        — unique slug e.g. "sports-loop"
//   name:        string        — display name
//   description: string        — optional summary
//   points:      [lng, lat][]  — ordered coordinate pairs (min 2)
// }
// -----------------------------------------------------------------------------
export async function POST(request) {
    // 1. Parse request body
    let body;
    try {
        body = await request.json();
    } catch {
        return new Response(
            JSON.stringify({ error: "Request body must be valid JSON." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    const { id, name, points, description = "" } = body;

    // 2. Validate required fields
    if (!id || typeof id !== "string" || !id.trim()) {
        return new Response(
            JSON.stringify({ error: "Field 'id' is required and must be a non-empty string." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    if (!name || typeof name !== "string" || !name.trim()) {
        return new Response(
            JSON.stringify({ error: "Field 'name' is required and must be a non-empty string." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    if (!Array.isArray(points) || points.length < 2) {
        return new Response(
            JSON.stringify({ error: "Field 'points' must be an array with at least 2 coordinate pairs." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    // Validate every coordinate is a finite [lng, lat] pair
    const hasInvalidPoint = points.some(
        (p) => !Array.isArray(p) || p.length !== 2 || !isFinite(p[0]) || !isFinite(p[1])
    );
    if (hasInvalidPoint) {
        return new Response(
            JSON.stringify({ error: "Each point must be a [longitude, latitude] pair of finite numbers." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    // 3. Fetch existing trails from S3 — default to [] if file doesn't exist yet
    let existing;
    try {
        const raw = await getS3Data("trailsPoints.json");
        existing = Array.isArray(raw) ? raw : [];
    } catch {
        return new Response(
            JSON.stringify({ error: "Failed to read existing trails from S3." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }

    // 4. Guard against duplicate IDs
    const normalizedId = id.trim().toLowerCase();
    const isDuplicate = existing.some(
        (trail) => trail.id?.toLowerCase() === normalizedId
    );

    if (isDuplicate) {
        return new Response(
            JSON.stringify({ error: `A trail with id "${normalizedId}" already exists. Choose a unique id.` }),
            { status: 409, headers: { "Content-Type": "application/json" } }
        );
    }

    // 5. Build the new trail record
    const newTrail = {
        id: normalizedId,
        name: name.trim(),
        description: description.trim(),
        points,
        createdAt: new Date().toISOString(),
    };

    // 6. Append and write the updated array back to S3
    const updated = [...existing, newTrail];
    const success = await putS3Data("trailsPoints.json", updated);

    if (!success) {
        return new Response(
            JSON.stringify({ error: "Failed to save updated trails to S3. Check bucket permissions." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }

    return new Response(
        JSON.stringify({ ok: true, trail: newTrail }),
        { status: 201, headers: { "Content-Type": "application/json" } }
    );
}