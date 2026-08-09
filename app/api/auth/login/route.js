import { NextResponse } from "next/server";
import { createSession, publicUser } from "@/lib/auth";
import { normalizeEmail, verifyPassword } from "@/lib/auth-crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models/user";
import { checkRateLimit, getRequestIp } from "@/lib/hazard-rate-limit";
import { requireSameOrigin } from "@/lib/request-security";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request) {
    const crossSiteResponse = requireSameOrigin(request);
    if (crossSiteResponse)
        return crossSiteResponse;
    let input;
    try {
        input = await request.json();
    }
    catch {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const email = normalizeEmail(input.email);
    const ip = getRequestIp(request);
    const rateLimit = await checkRateLimit({ namespace: "login", identifier: `${ip}:${email}`, limit: 8, windowMs: 15 * 60 * 1000 });
    if (!rateLimit.allowed)
        return NextResponse.json({ error: "Too many sign-in attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } });
    await connectToDatabase();
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user || !(await verifyPassword(String(input.password ?? ""), user.passwordHash))) {
        await writeAuditLog({ action: "auth.login.failed", targetType: "email", targetId: email || "unknown", ip });
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    if (user.status === "suspended")
        return NextResponse.json({ error: "This account has been suspended." }, { status: 403 });
    if (!user.emailVerifiedAt)
        return NextResponse.json({ error: "Verify your email before signing in.", needsVerification: true }, { status: 403 });
    await createSession(user._id);
    await writeAuditLog({ actorUserId: user._id, action: "auth.login.succeeded", targetType: "user", targetId: user._id, ip });
    return NextResponse.json({ user: publicUser(user) });
}
