import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('Missing MONGODB_URI in .env.local');

let client;
let mongoConnection;

if (!global.mongoConnection) {
    client = new MongoClient(uri);
    global.mongoConnection = client.connect();
}
mongoConnection = global.mongoConnection;

export default mongoConnection;