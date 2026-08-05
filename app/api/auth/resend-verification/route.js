import { NextResponse } from "next/server";
import { createVerificationCode, hashToken, normalizeEmail } from "@/lib/auth-crypto";
import { sendAuthEmail } from "@/lib/auth-email";
import { connectToDatabase } from "@/lib/mongodb";
import { AuthToken } from "@/lib/models/auth-token";
import { User } from "@/lib/models/user";

export async function POST(request) {
    const { email: rawEmail } = await request.json();
    const email = normalizeEmail(rawEmail);
    await connectToDatabase();
    const user = await User.findOne({ email, emailVerifiedAt: null, status: "active" });
    let developmentCode;
    if (user) {
        await AuthToken.deleteMany({ userId: user._id, purpose: "verify-email" });
        const code = createVerificationCode();
        await AuthToken.create({
            tokenHash: hashToken(code),
            userId: user._id,
            purpose: "verify-email",
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        });
        const delivery = await sendAuthEmail({
            to: email,
            subject: "Verify your Jagruk Bharat account",
            text: `Your Jagruk Bharat verification code is ${code}. It expires in 15 minutes.`,
        });
        if (process.env.NODE_ENV !== "production" && !delivery.delivered)
            developmentCode = code;
    }
    return NextResponse.json({
        message: "If the account needs verification, a new code has been sent.",
        ...(developmentCode ? { developmentCode } : {}),
    });
}
