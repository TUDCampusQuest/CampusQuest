import s3Client from '../../../lib/s3';
import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function GET() {
    try {
        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: 'data/trails.json', // Path to your data file in S3
        });

        const response = await s3Client.send(command);
        const data = await response.Body.transformToString();
        const trails = JSON.parse(data);

        return Response.json(trails);
    } catch (error) {
        console.error("S3 Fetch Error:", error);
        return Response.json({ error: "Failed to fetch data from S3" }, { status: 500 });
    }
}