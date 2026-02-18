import mongoConnection from '../../../lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const client = await mongoConnection;
        const dbName = process.env.MONGODB_DB || 'campus_quest'; 
        const db = client.db(dbName);
        const trails = await db
            .collection('trails')
            .find({})
            .toArray();

        return NextResponse.json(trails, { status: 200 });

    } catch (error) {
        console.error("AWS MongoDB Connection Error:", error);
        return NextResponse.json(
            { error: "Failed to connect to AWS Database", details: error.message },
            { status: 500 }
        );
    }
}