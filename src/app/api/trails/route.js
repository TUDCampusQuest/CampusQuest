import { getS3Data } from "@/lib/s3";

export async function GET() {
    // This fetches your trails/locations from your S3 bucket instead of Mongo
    const data = await getS3Data("trails.json"); 
    
    if (!data) {
        return new Response(JSON.stringify({ error: "No data found in S3" }), { status: 404 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
}