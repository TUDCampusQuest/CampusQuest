// GET returns the trail list from S3; POST validates and appends a new trail.
export const dynamic = "force-dynamic";

import { getS3Data, putS3Data } from "../../../lib/s3";

const NO_CACHE = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Pragma": "no-cache",
};

export async function GET() {
    try {
        const data = await getS3Data("trailsPoints.json");
        const trails = Array.isArray(data) ? data : [];
        return new Response(JSON.stringify(trails), { status: 200, headers: NO_CACHE });
    } catch (err) {
        console.error("GET /api/trails error:", err);
        return new Response(JSON.stringify([]), { status: 200, headers: NO_CACHE });
    }
}

export async function POST(request) {
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

    const hasInvalidPoint = points.some(
        p => !Array.isArray(p) || p.length !== 2 || !isFinite(p[0]) || !isFinite(p[1])
    );
    if (hasInvalidPoint) {
        return new Response(
            JSON.stringify({ error: "Each point must be a [longitude, latitude] pair of finite numbers." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

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

    const normalizedId = id.trim().toLowerCase();
    const isDuplicate = existing.some(t => t.id?.toLowerCase() === normalizedId);

    if (isDuplicate) {
        return new Response(
            JSON.stringify({ error: `A trail with id "${normalizedId}" already exists.` }),
            { status: 409, headers: { "Content-Type": "application/json" } }
        );
    }

    const newTrail = {
        id: normalizedId,
        name: name.trim(),
        description: description.trim(),
        points,
        createdAt: new Date().toISOString(),
    };

    const success = await putS3Data("trailsPoints.json", [...existing, newTrail]);

    if (!success) {
        return new Response(
            JSON.stringify({ error: "Failed to save updated trails to S3." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }

    return new Response(
        JSON.stringify({ ok: true, trail: newTrail }),
        { status: 201, headers: { "Content-Type": "application/json" } }
    );
}
