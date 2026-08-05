"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [resetMode, setResetMode] = useState(false);
    const [developmentCode, setDevelopmentCode] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function requestReset(event) {
        event.preventDefault();
        const requestedEmail = String(new FormData(event.currentTarget).get("email"));
        setSubmitting(true);
        setError("");
        try {
            const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: requestedEmail }) });
            const data = await response.json();
            setEmail(requestedEmail);
            setMessage(data.message);
            setDevelopmentCode(data.developmentCode || "");
            setResetMode(true);
        }
        catch {
            setError("Unable to request a reset code.");
        }
        finally {
            setSubmitting(false);
        }
    }

    async function resetPassword(event) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        if (form.get("password") !== form.get("confirmPassword")) {
            setError("Passwords do not match.");
            return;
        }
        setSubmitting(true);
        setError("");
        const response = await fetch("/api/auth/reset-password", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code: form.get("code"), password: form.get("password") }),
        });
        const data = await response.json();
        setSubmitting(false);
        if (!response.ok) {
            setError(data.error || "Unable to reset password.");
            return;
        }
        setMessage(data.message);
        setResetMode(false);
    }

    return <main className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
        <div className="w-full max-w-md">
            <Link href="/login" className="mb-6 inline-flex items-center text-sm text-slate-400 hover:text-white"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign In</Link>
            <Card className="border-slate-700 bg-slate-800/90 shadow-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400"><ShieldCheck className="h-7 w-7 text-slate-800" /></div>
                    <CardTitle className="text-2xl text-white">Reset Password</CardTitle>
                    <CardDescription className="text-slate-300">{resetMode ? "Enter your reset code and a new password." : "Request a one-time password-reset code."}</CardDescription>
                </CardHeader>
                <CardContent>
                    {message && <p className="mb-4 rounded-md bg-slate-700 p-3 text-sm text-slate-200">{message}</p>}
                    {developmentCode && resetMode && <p className="mb-4 rounded-md border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-200">Development code: <strong>{developmentCode}</strong></p>}
                    {error && <p role="alert" className="mb-4 text-sm text-red-300">{error}</p>}
                    {resetMode ? <form onSubmit={resetPassword} className="space-y-4">
                        <div><Label htmlFor="code" className="text-white">Six-digit reset code</Label><Input id="code" name="code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required className="border-slate-600 bg-slate-700 text-white" /></div>
                        <div><Label htmlFor="password" className="text-white">New password</Label><Input id="password" name="password" type="password" minLength={8} required className="border-slate-600 bg-slate-700 text-white" /></div>
                        <div><Label htmlFor="confirmPassword" className="text-white">Confirm new password</Label><Input id="confirmPassword" name="confirmPassword" type="password" minLength={8} required className="border-slate-600 bg-slate-700 text-white" /></div>
                        <Button disabled={submitting} className="w-full bg-amber-400 text-slate-900 hover:bg-amber-500">{submitting ? "Updating…" : "Update Password"}</Button>
                    </form> : <form onSubmit={requestReset} className="space-y-4">
                        <div><Label htmlFor="email" className="text-white">Email Address</Label><Input id="email" name="email" type="email" required className="h-11 border-slate-600 bg-slate-700 text-white" /></div>
                        <Button disabled={submitting} className="h-11 w-full bg-amber-400 text-slate-900 hover:bg-amber-500"><Mail className="mr-2 h-4 w-4" /> {submitting ? "Sending…" : "Send Reset Code"}</Button>
                    </form>}
                </CardContent>
            </Card>
        </div>
    </main>;
}
