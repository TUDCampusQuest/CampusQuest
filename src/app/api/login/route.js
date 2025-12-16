export async function GET(req, res) {

    console.log("in the api page")

    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    const pass = searchParams.get('pass')

    console.log(email);
    console.log(pass);

    const { MongoClient } = require('mongodb');
    const url = 'ourdatabase';
    const client = new MongoClient(url);
    const dbName = 'app';
    await client.connect();

    console.log('Connected successfully to server');

    const db = client.db(dbName);
    const collection = db.collection('login');
    const findResult = await collection.find({"username": email}).toArray();

    console.log('Found documents =>', findResult);

    let valid = false

    if(findResult.length >0 ){
        valid = true;
        console.log("login valid")
    } else {
        valid = false;
        console.log("login invalid")
    }
    return Response.json({ "data":"" + valid + ""})
}