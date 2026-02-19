import { getS3Data } from "@/lib/s3";

export const dynamic = 'force-dynamic';

export async function GET() {
    // Ensure the key matches exactly where you uploaded the file in S3
    const data = await getS3Data("data/locations.json");

    if (!data) {
        return Response.json({ error: "Failed to fetch campus data from S3" }, { status: 500 });
    }

    return Response.json(data);
}