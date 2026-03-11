export const dynamic = 'force-dynamic'; // prevents build-time errors with AWS
import { getS3Data, putS3Data } from "@/lib/s3";

export async function GET() {
    const data = await getS3Data("trailsPoints.json");

    if (!data) {
        return new Response(JSON.stringify({ error: "No data found in S3" }), { status: 404 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
}

export async function POST(request) {
    try {
        const newTrail = await request.json();

        // Validate required fields before touching S3
        if (!newTrail.id || !newTrail.name || !Array.isArray(newTrail.points)) {
            return new Response(
                JSON.stringify({ error: "Missing required fields: id, name, points" }),
                { status: 400 }
            );
        }

        // Fetch existing trails — default to empty array if file doesn't exist yet
        const existing = await getS3Data("trailsPoints.json") ?? [];

        // Guard against duplicate IDs
        const isDuplicate = existing.some((trail) => trail.id === newTrail.id);
        if (isDuplicate) {
            return new Response(
                JSON.stringify({ error: `A trail with id "${newTrail.id}" already exists.` }),
                { status: 409 }
            );
        }

        // Append the new trail and write back to S3
        const updated = [...existing, newTrail];
        const success = await putS3Data("trailsPoints.json", updated);

        if (!success) {
            return new Response(JSON.stringify({ error: "Failed to write to S3" }), { status: 500 });
        }

        return new Response(JSON.stringify({ ok: true, trail: newTrail }), { status: 201 });
    } catch (err) {
        console.error("POST /api/trails error:", err);
        return new Response(JSON.stringify({ error: "Unexpected server error" }), { status: 500 });
    }
}