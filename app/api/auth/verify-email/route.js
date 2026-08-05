import { NextResponse } from "next/server";
import { createSession, publicUser } from "@/lib/auth";
import { hashToken, normalizeEmail } from "@/lib/auth-crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { AuthToken } from "@/lib/models/auth-token";
import { User } from "@/lib/models/user";

export async function POST(request) {
    const input = await request.json();
    const email = normalizeEmail(input.email);
    if (!/^\d{6}$/.test(String(input.code ?? "")))
        return NextResponse.json({ error: "Enter the six-digit verification code." }, { status: 400 });
    await connectToDatabase();
    const user = await User.findOne({ email });
    if (!user)
        return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 400 });
    const token = await AuthToken.findOne({
        userId: user._id,
        purpose: "verify-email",
        tokenHash: hashToken(input.code),
        expiresAt: { $gt: new Date() },
    });
    if (!token)
        return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 400 });
    user.emailVerifiedAt = new Date();
    await user.save();
    await AuthToken.deleteMany({ userId: user._id, purpose: "verify-email" });
    await createSession(user._id);
    return NextResponse.json({ user: publicUser(user) });
}
