"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { firebaseActionUrl, getFirebaseAuth } from "@/lib/firebase-client";

export default function ForgotPasswordPage() {
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function requestReset(event) {
        event.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            const email = String(new FormData(event.currentTarget).get("email"));
            await sendPasswordResetEmail(getFirebaseAuth(), email, { url: firebaseActionUrl("/login") });
            setMessage("If this email has an account, Firebase has sent a password-reset link. Check your inbox and spam folder.");
        }
        catch (resetError) {
            setError(resetError instanceof Error ? resetError.message.replace("Firebase: ", "") : "Unable to send reset email.");
        }
        finally { setSubmitting(false); }
    }

    return <main className="flex min-h-screen items-center justify-center bg-slate-900 p-4"><div className="w-full max-w-md"><Link href="/login" className="mb-6 inline-flex items-center text-sm text-slate-400 hover:text-white"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign In</Link><Card className="border-slate-700 bg-slate-800/90 shadow-lg"><CardHeader className="text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400"><ShieldCheck className="h-7 w-7 text-slate-800" /></div><CardTitle className="text-2xl text-white">Reset Password</CardTitle><CardDescription className="text-slate-300">Firebase will send a secure password-reset link.</CardDescription></CardHeader><CardContent>{message && <p className="mb-4 rounded-md bg-slate-700 p-3 text-sm text-slate-200">{message}</p>}{error && <p role="alert" className="mb-4 text-sm text-red-300">{error}</p>}<form onSubmit={requestReset} className="space-y-4"><div><Label htmlFor="email" className="text-white">Email Address</Label><Input id="email" name="email" type="email" required className="h-11 border-slate-600 bg-slate-700 text-white" /></div><Button disabled={submitting} className="h-11 w-full bg-amber-400 text-slate-900 hover:bg-amber-500"><Mail className="mr-2 h-4 w-4" /> {submitting ? "Sending…" : "Send Reset Link"}</Button></form></CardContent></Card></div></main>;
}
