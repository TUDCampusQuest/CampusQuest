import { PutCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";
import { db, STAFF_TABLE } from "../../../../lib/dynamo";

export const dynamic = "force-dynamic";


export async function POST(request) {
    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
    }

    const { secret, name, email, password } = body;

    if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
        return Response.json({ ok: false, error: "Forbidden." }, { status: 403 });
    }

    if (!name || !email || !password) {
        return Response.json({ ok: false, error: "Name, email and password are required." }, { status: 400 });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 12);

        await db.send(new PutCommand({
            TableName: STAFF_TABLE,
            Item: {
                email:     email.trim().toLowerCase(),
                name:      name.trim(),
                passwordHash,
                createdAt: new Date().toISOString(),
            },
        }));

        return Response.json({ ok: true, message: "First staff account created." }, { status: 201 });

    } catch (err) {
        console.error("Seed error:", err);
        return Response.json({ ok: false, error: "Server error." }, { status: 500 });
    }
}