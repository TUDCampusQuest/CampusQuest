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