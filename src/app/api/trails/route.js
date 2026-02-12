import mongoConnection from '../../../lib/mongodb';

export async function GET() {
    const client = await mongoConnection;
    const dbName = process.env.MONGODB_DB || 'app';

    const trails = await client
        .db(dbName)
        .collection('trails')
        .find({})
        .sort({ key: 1 })
        .toArray();

    return Response.json(trails);
}