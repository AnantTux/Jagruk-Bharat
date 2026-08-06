"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, ShieldCheck } from "lucide-react";
import { sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteFooter } from "@/components/site-footer";
import { firebaseActionUrl, getFirebaseAuth } from "@/lib/firebase-client";

export default function LoginPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [resending, setResending] = useState(false);
    const [unverifiedEmail, setUnverifiedEmail] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        setError("");
        setUnverifiedEmail("");
        const form = new FormData(event.currentTarget);
        try {
            const credentials = await signInWithEmailAndPassword(getFirebaseAuth(), String(form.get("email")), String(form.get("password")));
            await credentials.user.reload();
            if (!credentials.user.emailVerified) {
                setUnverifiedEmail(credentials.user.email || String(form.get("email")));
                throw new Error("Verify your email first. Check your inbox and spam folder, then sign in again.");
            }
            const idToken = await credentials.user.getIdToken(true);
            const response = await fetch("/api/auth/firebase/session", {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }),
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.error || "Unable to start your session.");
            const nextPath = new URLSearchParams(window.location.search).get("next") === "/report" ? "/report" : "/dashboard";
            router.push(nextPath);
            router.refresh();
        }
        catch (loginError) {
            setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
        }
        finally { setSubmitting(false); }
    }

    async function resendVerification() {
        setResending(true);
        setError("");
        try {
            const user = getFirebaseAuth().currentUser;
            if (!user)
                throw new Error("Sign in again first, then request a new verification email.");
            await sendEmailVerification(user, { url: firebaseActionUrl("/login") });
            setError(`A new verification link was sent to ${unverifiedEmail}. Check inbox, spam, and Promotions.`);
        }
        catch (resendError) {
            setError(resendError instanceof Error ? resendError.message.replace("Firebase: ", "") : "Unable to resend the verification email.");
        }
        finally { setResending(false); }
    }

    return <div className="flex min-h-screen flex-col bg-slate-900"><main className="flex flex-1 items-center justify-center p-4"><div className="w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center text-sm text-slate-400 hover:text-white"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        <Card className="border-slate-700 bg-slate-800/90 shadow-lg"><CardHeader className="text-center"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400"><ShieldCheck className="h-7 w-7 text-slate-800" /></div><CardTitle className="text-2xl text-white">Welcome Back</CardTitle><CardDescription className="text-slate-300">Sign in with your verified Jagruk Bharat account.</CardDescription></CardHeader><CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">{error && <p role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}<div className="space-y-2"><Label htmlFor="email" className="text-white">Email Address</Label><Input id="email" name="email" type="email" autoComplete="email" required className="h-11 border-slate-600 bg-slate-700 text-white" /></div><div className="space-y-2"><div className="flex justify-between"><Label htmlFor="password" className="text-white">Password</Label><Link href="/forgot-password" className="text-sm text-amber-400 hover:text-amber-300">Forgot password?</Link></div><Input id="password" name="password" type="password" autoComplete="current-password" required className="h-11 border-slate-600 bg-slate-700 text-white" /></div><Button disabled={submitting} className="h-11 w-full bg-amber-400 text-slate-900 hover:bg-amber-500"><Shield className="mr-2 h-4 w-4" /> {submitting ? "Signing in…" : "Sign In"}</Button></form>
            {unverifiedEmail && <Button type="button" variant="outline" disabled={resending} onClick={resendVerification} className="mt-3 w-full border-amber-400/60 text-amber-300 hover:bg-amber-400/10 hover:text-amber-200">{resending ? "Sending verification email…" : "Resend verification email"}</Button>}
            <p className="mt-6 text-center text-sm text-slate-400">Don&apos;t have an account? <Link href="/signup" className="font-medium text-amber-400">Sign up here</Link></p>
        </CardContent></Card></div></main><SiteFooter compact /></div>;
}
