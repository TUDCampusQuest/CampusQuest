export const dynamic = "force-dynamic";

import { getS3Data, putS3Data } from "@/lib/s3";

// -----------------------------------------------------------------------------
// GET /api/trails
// Fetches the full trails array from S3 and returns it.
// Returns an empty array if the file does not exist yet rather than a 404,
// so the UI renders cleanly on first run before any trails have been saved.
// -----------------------------------------------------------------------------
export async function GET() {
    const data = await getS3Data("trailsPoints.json");

    // S3 file missing or unreadable — return empty array so the UI does not crash
    if (!data) {
        return new Response(JSON.stringify([]), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }

    const trails = Array.isArray(data) ? data : [];

    return new Response(JSON.stringify(trails), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
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
//
// Steps:
//   1. Parse + validate the request body
//   2. Fetch the current array from S3 (default [] if not found)
//   3. Check for duplicate id
//   4. Append the new trail and write the updated array back to S3
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

    // 3. Fetch existing trails from S3
    // Defaults to [] when the file does not exist yet (first trail ever saved).
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
        points,                               // [lng, lat][] — Mapbox-ready format
        createdAt: new Date().toISOString(),  // ISO timestamp for sorting/display
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