"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteFooter } from "@/components/site-footer";
import { getFirebaseAuth } from "@/lib/firebase-client";

export default function ForgotPasswordPage() {
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => { document.body.classList.add("auth-page-active"); return () => document.body.classList.remove("auth-page-active"); }, []);

    async function requestReset(event) {
        event.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            const email = String(new FormData(event.currentTarget).get("email"));
            await sendPasswordResetEmail(getFirebaseAuth(), email);
            setMessage("If this email has an account, Firebase has sent a password-reset link. Check your inbox and spam folder.");
        }
        catch (resetError) {
            setError(resetError instanceof Error ? resetError.message.replace("Firebase: ", "") : "Unable to send reset email.");
        }
        finally { setSubmitting(false); }
    }

    return <div className="flex min-h-screen flex-col bg-background text-foreground">
        <AppHeader showDashboard={false} />
        <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
            <div className="w-full max-w-md">
                <Link href="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-[#0e539d]"><ArrowLeft className="h-4 w-4" /> Back to Sign In</Link>
                <Card className="border-border bg-white">
                    <CardHeader className="text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[var(--radius-control)] bg-primary-soft"><ShieldCheck className="h-7 w-7 text-primary" /></div><CardTitle className="font-display text-[2rem] leading-[1.2] text-foreground">Reset Password</CardTitle><CardDescription>Firebase will send a secure password-reset link.</CardDescription></CardHeader>
                    <CardContent>{message && <p className="mb-4 rounded-[var(--radius-control)] border border-success/30 bg-success/5 p-3 text-sm text-success">{message}</p>}{error && <p role="alert" className="mb-4 rounded-[var(--radius-control)] border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}<form onSubmit={requestReset} className="space-y-4"><div><Label htmlFor="email">Email Address</Label><Input id="email" name="email" type="email" required /></div><Button disabled={submitting} size="lg" className="w-full"><Mail className="h-4 w-4" /> {submitting ? "Sending…" : "Send Reset Link"}</Button></form></CardContent>
                </Card>
            </div>
        </main>
        <SiteFooter compact />
    </div>;
}
