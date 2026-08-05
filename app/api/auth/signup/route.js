import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { createVerificationCode, hashPassword, hashToken, normalizeEmail, validatePassword } from "@/lib/auth-crypto";
import { sendAuthEmail } from "@/lib/auth-email";
import { AuthToken } from "@/lib/models/auth-token";
import { User } from "@/lib/models/user";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
    try {
        const input = await request.json();
        const email = normalizeEmail(input.email);
        const passwordError = validatePassword(input.password);
        if (!EMAIL_PATTERN.test(email) || passwordError || !input.firstName?.trim() || !input.lastName?.trim() || !input.region?.trim()) {
            return NextResponse.json({ error: passwordError ?? "Please complete all required fields." }, { status: 400 });
        }
        await connectToDatabase();
        if (await User.exists({ email }))
            return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

        const user = await User.create({
            email,
            firstName: input.firstName.trim(),
            lastName: input.lastName.trim(),
            region: input.region.trim(),
            role: input.role?.trim() || "citizen",
            passwordHash: await hashPassword(input.password),
            notificationsEnabled: Boolean(input.notificationsEnabled),
        });
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
        return NextResponse.json({
            message: delivery.delivered ? "Check your email for the verification code." : "Account created. Use the development verification code below.",
            ...(process.env.NODE_ENV !== "production" && !delivery.delivered ? { developmentCode: code } : {}),
        }, { status: 201 });
    }
    catch {
        return NextResponse.json({ error: "Could not create the account." }, { status: 500 });
    }
}
