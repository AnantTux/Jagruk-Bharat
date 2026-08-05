import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import { createSessionToken, hashToken } from "@/lib/auth-crypto";
import { Session } from "@/lib/models/session";
import { User } from "@/lib/models/user";

export const SESSION_COOKIE = "jagruk-bharat_session";
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export function publicUser(user) {
    return {
        id: String(user._id),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        region: user.region,
        role: user.role,
        emailVerified: Boolean(user.emailVerifiedAt),
        status: user.status,
    };
}

export async function createSession(userId) {
    await connectToDatabase();
    const token = createSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    await Session.create({ tokenHash: hashToken(token), userId, expiresAt });
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
    });
}

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token)
        return null;
    await connectToDatabase();
    const session = await Session.findOne({
        tokenHash: hashToken(token),
        expiresAt: { $gt: new Date() },
    }).lean();
    if (!session)
        return null;
    const user = await User.findById(session.userId).lean();
    if (!user || user.status !== "active" || !user.emailVerifiedAt)
        return null;
    return user;
}

export async function destroyCurrentSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (token) {
        await connectToDatabase();
        await Session.deleteOne({ tokenHash: hashToken(token) });
    }
    cookieStore.delete(SESSION_COOKIE);
}

export async function suspendUser(userId, reason = "Suspended by administrator") {
    await connectToDatabase();
    const user = await User.findByIdAndUpdate(userId, {
        status: "suspended",
        suspendedAt: new Date(),
        suspensionReason: reason,
    }, { new: true });
    await Session.deleteMany({ userId });
    return user;
}
