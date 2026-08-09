import { NextResponse } from "next/server";
import { createVerificationCode, hashToken, normalizeEmail } from "@/lib/auth-crypto";
import { sendAuthEmail } from "@/lib/auth-email";
import { connectToDatabase } from "@/lib/mongodb";
import { AuthToken } from "@/lib/models/auth-token";
import { User } from "@/lib/models/user";
import { checkRateLimit, getRequestIp } from "@/lib/hazard-rate-limit";
import { requireSameOrigin } from "@/lib/request-security";

const MESSAGE = "If that account exists, a password-reset code has been sent.";

export async function POST(request) {
    const crossSiteResponse = requireSameOrigin(request);
    if (crossSiteResponse)
        return crossSiteResponse;
    const input = await request.json();
    const email = normalizeEmail(input.email);
    const rateLimit = await checkRateLimit({ namespace: "password-reset", identifier: `${getRequestIp(request)}:${email}`, limit: 3, windowMs: 15 * 60 * 1000 });
    if (!rateLimit.allowed)
        return NextResponse.json({ message: MESSAGE }, { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } });
    await connectToDatabase();
    const user = await User.findOne({ email, status: "active" });
    let developmentCode;
    if (user) {
        await AuthToken.deleteMany({ userId: user._id, purpose: "reset-password" });
        const code = createVerificationCode();
        await AuthToken.create({
            tokenHash: hashToken(code),
            userId: user._id,
            purpose: "reset-password",
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        });
        const delivery = await sendAuthEmail({
            to: email,
            subject: "Reset your Jagruk Bharat password",
            text: `Your Jagruk Bharat password-reset code is ${code}. It expires in 15 minutes.`,
        });
        if (process.env.NODE_ENV !== "production" && !delivery.delivered)
            developmentCode = code;
    }
    return NextResponse.json({ message: MESSAGE, ...(developmentCode ? { developmentCode } : {}) });
}
