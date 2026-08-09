import { NextResponse } from "next/server";
import { createSession, publicUser } from "@/lib/auth";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models/user";

function text(value, maxLength) {
    return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request) {
    try {
        const body = await request.json();
        if (typeof body.idToken !== "string")
            return NextResponse.json({ error: "Missing Firebase sign-in token." }, { status: 400 });

        const decoded = await verifyFirebaseIdToken(body.idToken);
        if (!decoded.email || !decoded.email_verified)
            return NextResponse.json({ error: "Verify your email address before signing in." }, { status: 403 });

        await connectToDatabase();
        let user = await User.findOne({ firebaseUid: decoded.uid });
        if (!user)
            user = await User.findOne({ email: decoded.email.toLowerCase() });

        if (user) {
            user.firebaseUid = decoded.uid;
            user.emailVerifiedAt = new Date();
            await user.save();
        }
        else {
            const firstName = text(body.firstName, 80);
            const lastName = text(body.lastName, 80);
            const region = text(body.region, 100);
            if (!firstName || !lastName || !region)
                return NextResponse.json({ error: "Your account profile is incomplete.", requiresProfile: true }, { status: 409 });
            user = await User.create({
                firebaseUid: decoded.uid,
                email: decoded.email.toLowerCase(),
                firstName,
                lastName,
                region,
                // Firebase proves identity, not platform authorization.
                role: "citizen",
                notificationsEnabled: Boolean(body.notificationsEnabled),
                emailVerifiedAt: new Date(),
            });
        }

        if (user.status !== "active")
            return NextResponse.json({ error: "This account has been suspended." }, { status: 403 });

        await createSession(user._id);
        return NextResponse.json({ user: publicUser(user) });
    }
    catch (error) {
        console.error("Firebase session exchange failed", error);
        return NextResponse.json({ error: "Unable to verify this Firebase sign-in. Check the Firebase configuration." }, { status: 401 });
    }
}
