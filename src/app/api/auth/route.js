export const dynamic = "force-dynamic";

export async function POST(request) {
    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
    }

    const { email, password } = body;

    const correctEmail    = process.env.ADMIN_EMAIL    ?? "";
    const correctPassword = process.env.ADMIN_PASSWORD ?? "";

    if (!correctEmail || !correctPassword) {
        return Response.json({ ok: false, error: "Admin credentials not configured." }, { status: 500 });
    }

    const valid =
        email?.trim().toLowerCase() === correctEmail.trim().toLowerCase() &&
        password === correctPassword;

    if (valid) {
        return Response.json({ ok: true }, { status: 200 });
    }

    // Generic error — don't reveal which field was wrong
    return Response.json({ ok: false, error: "Incorrect email or password." }, { status: 401 });
}