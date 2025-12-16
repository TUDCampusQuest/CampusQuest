export async function GET(req, res) {

    console.log("in the api page")

    const { MongoClient } = require('mongodb');
    const url = 'mongodb://root:example@localhost:27017/';
    const client = new MongoClient(url);
    const dbName = 'app';

    await client.connect();
    console.log('Connected successfully to server');

    const db = client.db(dbName);
    const collection = db.collection('products');
    const findResult = await collection.find({}).toArray();

    console.log('Found documents =>', findResult);
    return Response.json(findResult)

}