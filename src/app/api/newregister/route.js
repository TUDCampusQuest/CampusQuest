export async function GET(req, res) {

    console.log("in the api page")

    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    const pass = searchParams.get('pass')
    const text = searchParams.get('text')
    const tel = searchParams.get('tel')

    console.log(email);
    console.log(pass);
    console.log(text);
    console.log(tel);

    return Response.json({ "data":"valid" })
}