import { getS3Data } from "@/lib/s3";

export async function GET() {
    const data = await getS3Data("data/locations.json");

    if (!data) {
        return Response.json({ error: "Failed to fetch from S3" }, { status: 500 });
    }

    return Response.json(data);
}