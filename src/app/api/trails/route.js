export const dynamic = 'force-dynamic'; // This prevents build-time errors with AWS
import { getS3Data } from "@/lib/s3";

export async function GET() {
    const data = await getS3Data("trails.json"); 
    
    if (!data) {
        return new Response(JSON.stringify({ error: "No data found in S3" }), { status: 404 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
}