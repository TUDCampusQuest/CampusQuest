import clientPromise from '../../../lib/mongodb';

export async function GET() {
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB || 'app';

    const trails = await client
        .db(dbName)
        .collection('trails')
        .find({})
        .sort({ key: 1 })
        .toArray();

    return Response.json(trails);
}