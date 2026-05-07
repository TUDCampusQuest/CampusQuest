// Verifies staff email and password against DynamoDB and returns ok/name on success.
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";
import { db, STAFF_TABLE } from "../../../lib/dynamo";

export const dynamic = "force-dynamic";

export async function POST(request) {
    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
    }

    const { email, password } = body;

    if (!email || !password) {
        return Response.json({ ok: false, error: "Email and password are required." }, { status: 400 });
    }

    try {
        const result = await db.send(new GetCommand({
            TableName: STAFF_TABLE,
            Key: { email: email.trim().toLowerCase() },
        }));

        const staff = result.Item;

        if (!staff) {
            return Response.json({ ok: false, error: "Incorrect email or password." }, { status: 401 });
        }

        const valid = await bcrypt.compare(password, staff.passwordHash);

        if (!valid) {
            return Response.json({ ok: false, error: "Incorrect email or password." }, { status: 401 });
        }

        return Response.json({ ok: true, name: staff.name ?? "Staff" }, { status: 200 });

    } catch (err) {
        console.error("Auth error:", err);
        return Response.json({ ok: false, error: "Server error — please try again." }, { status: 500 });
    }
}
