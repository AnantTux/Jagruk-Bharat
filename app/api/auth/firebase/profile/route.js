import { NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models/user";

function text(value, maxLength) {
    return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request) {
    try {
        const body = await request.json();
        const decoded = await verifyFirebaseIdToken(body.idToken);
        if (!decoded.email)
            return NextResponse.json({ error: "Firebase did not provide an email address." }, { status: 400 });
        await connectToDatabase();
        let user = await User.findOne({ firebaseUid: decoded.uid });
        if (!user)
            user = await User.findOne({ email: decoded.email.toLowerCase() });
        if (!user) {
            const firstName = text(body.firstName, 80);
            const lastName = text(body.lastName, 80);
            const region = text(body.region, 100);
            if (!firstName || !lastName || !region)
                return NextResponse.json({ error: "Your account profile is incomplete." }, { status: 400 });
            await User.create({
                firebaseUid: decoded.uid,
                email: decoded.email.toLowerCase(),
                firstName, lastName, region,
                // Public profile completion must never grant privileges.
                role: "citizen",
                notificationsEnabled: Boolean(body.notificationsEnabled),
            });
        }
        else if (!user.firebaseUid) {
            user.firebaseUid = decoded.uid;
            await user.save();
        }
        return NextResponse.json({ ok: true });
    }
    catch (error) {
        console.error("Firebase profile creation failed", error);
        return NextResponse.json({ error: "Unable to save your profile." }, { status: 400 });
    }
}
