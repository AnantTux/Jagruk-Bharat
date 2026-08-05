import { NextResponse } from "next/server";
import { createSession, publicUser } from "@/lib/auth";
import { normalizeEmail, verifyPassword } from "@/lib/auth-crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models/user";

export async function POST(request) {
    const input = await request.json();
    const email = normalizeEmail(input.email);
    await connectToDatabase();
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user || !(await verifyPassword(String(input.password ?? ""), user.passwordHash)))
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    if (user.status === "suspended")
        return NextResponse.json({ error: "This account has been suspended." }, { status: 403 });
    if (!user.emailVerifiedAt)
        return NextResponse.json({ error: "Verify your email before signing in.", needsVerification: true }, { status: 403 });
    await createSession(user._id);
    return NextResponse.json({ user: publicUser(user) });
}
