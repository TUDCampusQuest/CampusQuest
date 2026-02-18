<<<<<<< HEAD
import mongoConnection from '../../../lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // 1. Establish connection with a safety check
        const client = await mongoConnection;
        
        // AWS/DocumentDB sometimes requires explicit DB naming from env
        const dbName = process.env.MONGODB_DB || 'campus_quest'; 
        const db = client.db(dbName);

        // 2. Fetch trails with a limit to prevent AWS memory spikes
        const trails = await db
            .collection('trails')
            .find({})
            .toArray();
=======
import { getS3Data } from "@/lib/s3";

export async function GET() {
    const trails = await getS3Data('data/trails.json');

    if (!trails) {
        return Response.json({ error: "Trails not found in S3" }, { status: 404 });
    }
>>>>>>> cea9bbdf4e0eaf2ac994fdc38dc0dd30b256b790

        // 3. Return a clean JSON response
        return NextResponse.json(trails, { status: 200 });

    } catch (error) {
        console.error("AWS MongoDB Connection Error:", error);
        
        // Return a 500 error instead of hanging (prevents White Screen)
        return NextResponse.json(
            { error: "Failed to connect to AWS Database", details: error.message },
            { status: 500 }
        );
    }
}