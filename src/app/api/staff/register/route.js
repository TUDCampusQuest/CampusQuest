// Creates a new staff account in DynamoDB after validating fields and checking for duplicates.
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
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

    const { name, email, password } = body;

    if (!name || !email || !password) {
        return Response.json({ ok: false, error: "Name, email and password are required." }, { status: 400 });
    }

    if (password.length < 8) {
        return Response.json({ ok: false, error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const normalisedEmail = email.trim().toLowerCase();

    try {
        const existing = await db.send(new GetCommand({
            TableName: STAFF_TABLE,
            Key: { email: normalisedEmail },
        }));

        if (existing.Item) {
            return Response.json({ ok: false, error: "An account with that email already exists." }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await db.send(new PutCommand({
            TableName: STAFF_TABLE,
            Item: {
                email: normalisedEmail,
                name: name.trim(),
                passwordHash,
                createdAt: new Date().toISOString(),
            },
        }));

        return Response.json({ ok: true }, { status: 201 });

    } catch (err) {
        console.error("Register error:", err);
        return Response.json({ ok: false, error: "Server error — please try again." }, { status: 500 });
    }
}
