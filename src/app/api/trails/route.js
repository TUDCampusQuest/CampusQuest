import { getS3Data } from "@/lib/s3";

export async function GET() {
    // This calls the helper function that handles the connection and JSON parsing
    const trails = await getS3Data('data/trails.json');

    if (!trails) {
        return Response.json({ error: "Trails not found in S3" }, { status: 404 });
    }

    return Response.json(trails);
}