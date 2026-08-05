import { NextResponse } from "next/server";
import { hashPassword, hashToken, normalizeEmail, validatePassword } from "@/lib/auth-crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { AuthToken } from "@/lib/models/auth-token";
import { Session } from "@/lib/models/session";
import { User } from "@/lib/models/user";

export async function POST(request) {
    const input = await request.json();
    const passwordError = validatePassword(input.password);
    if (passwordError)
        return NextResponse.json({ error: passwordError }, { status: 400 });
    await connectToDatabase();
    const user = await User.findOne({ email: normalizeEmail(input.email), status: "active" });
    if (!user)
        return NextResponse.json({ error: "Invalid or expired reset code." }, { status: 400 });
    const token = await AuthToken.findOne({
        userId: user._id,
        purpose: "reset-password",
        tokenHash: hashToken(input.code),
        expiresAt: { $gt: new Date() },
    });
    if (!token)
        return NextResponse.json({ error: "Invalid or expired reset code." }, { status: 400 });
    user.passwordHash = await hashPassword(input.password);
    await user.save();
    await Promise.all([
        AuthToken.deleteMany({ userId: user._id, purpose: "reset-password" }),
        Session.deleteMany({ userId: user._id }),
    ]);
    return NextResponse.json({ message: "Password updated. You can now sign in." });
}
