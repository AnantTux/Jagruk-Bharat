"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, ShieldCheck } from "lucide-react";
import { GoogleAuthProvider, sendEmailVerification, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteFooter } from "@/components/site-footer";
import { getFirebaseAuth } from "@/lib/firebase-client";

export default function LoginPage() {
    const router = useRouter(); const [submitting, setSubmitting] = useState(false); const [resending, setResending] = useState(false); const [unverifiedEmail, setUnverifiedEmail] = useState(""); const [error, setError] = useState("");
    useEffect(() => { document.body.classList.add("auth-page-active"); return () => document.body.classList.remove("auth-page-active"); }, []);
    async function exchange(user) { const nextPath = new URLSearchParams(window.location.search).get("next") === "/report" ? "/report" : "/dashboard"; const response = await fetch("/api/auth/firebase/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: await user.getIdToken(true) }) }); const data = await response.json(); if (data.requiresProfile) { router.push(`/complete-profile?next=${encodeURIComponent(nextPath)}`); return; } if (!response.ok) throw new Error(data.error || "Unable to start your session."); router.push(nextPath); router.refresh(); }
    async function handleSubmit(event) { event.preventDefault(); setSubmitting(true); setError(""); setUnverifiedEmail(""); try { const form = new FormData(event.currentTarget); const credentials = await signInWithEmailAndPassword(getFirebaseAuth(), String(form.get("email")), String(form.get("password"))); await credentials.user.reload(); if (!credentials.user.emailVerified) { setUnverifiedEmail(credentials.user.email || String(form.get("email"))); throw new Error("Verify your email first, or use Google sign-in."); } await exchange(credentials.user); } catch (loginError) { setError(loginError instanceof Error ? loginError.message : "Unable to sign in."); } finally { setSubmitting(false); } }
    async function googleSignIn() { setSubmitting(true); setError(""); try { const provider = new GoogleAuthProvider(); provider.setCustomParameters({ prompt: "select_account" }); const result = await signInWithPopup(getFirebaseAuth(), provider); await exchange(result.user); } catch (googleError) { setError(googleSignInMessage(googleError)); } finally { setSubmitting(false); } }
    async function resendVerification() { setResending(true); try { const user = getFirebaseAuth().currentUser; if (!user) throw new Error("Sign in again first."); await sendEmailVerification(user); setError(`A new verification link was sent to ${unverifiedEmail}.`); } catch (e) { setError(e instanceof Error ? e.message : "Unable to resend verification."); } finally { setResending(false); } }
    return <div className="flex min-h-screen flex-col bg-background">
        <AppHeader subtitle="Secure sign in" />
        <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to home
                </Link>
                <Card className="gap-0 py-0">
                    <CardHeader className="px-6 pb-4 pt-8 text-center sm:px-8">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-control)] bg-primary">
                            <ShieldCheck className="h-7 w-7 text-primary-foreground" aria-hidden="true" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-[-0.02em] text-slate-950">Welcome back</CardTitle>
                        <CardDescription className="mt-2 text-sm leading-5 text-slate-600">Sign in with your account, or continue securely with Google.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 px-6 pb-8 pt-2 sm:px-8">
                        {error ? <p role="alert" className="rounded-[var(--radius-control)] border border-[#fca5a5] bg-[#fef2f2] p-3 text-sm font-semibold text-destructive">{error}</p> : null}
                        <Button type="button" disabled={submitting} onClick={() => void googleSignIn()} variant="outline" className="w-full text-slate-950">
                            <span className="font-bold text-primary">G</span>Continue with Google
                        </Button>
                        <div className="flex items-center gap-3 text-xs text-slate-500"><span className="h-px flex-1 bg-border" />or email<span className="h-px flex-1 bg-border" /></div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input id="email" name="email" type="email" autoComplete="email" required />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between gap-4"><Label htmlFor="password">Password</Label><Link href="/forgot-password" className="text-sm font-semibold text-primary hover:underline">Forgot password?</Link></div>
                                <Input id="password" name="password" type="password" autoComplete="current-password" required />
                            </div>
                            <Button disabled={submitting} className="w-full"><Shield className="h-4 w-4" aria-hidden="true" />{submitting ? "Signing in…" : "Sign in"}</Button>
                        </form>
                        {unverifiedEmail ? <Button type="button" variant="outline" disabled={resending} onClick={() => void resendVerification()} className="w-full">{resending ? "Sending…" : "Resend verification email"}</Button> : null}
                        <p className="text-center text-sm text-slate-600">Don&apos;t have an account? <Link href="/signup" className="font-semibold text-primary hover:underline">Sign up here</Link></p>
                    </CardContent>
                </Card>
            </div>
        </main>
        <SiteFooter compact />
    </div>;
}

function googleSignInMessage(error) {
    const code = typeof error === "object" && error && "code" in error ? error.code : "";
    if (code === "auth/operation-not-allowed") return "Google sign-in has not been enabled for this Firebase project yet.";
    if (code === "auth/unauthorized-domain") return "This website address is not authorised for Google sign-in in Firebase yet.";
    if (code === "auth/internal-error") return "Google sign-in could not finish. Please try again.";
    return error instanceof Error ? error.message.replace("Firebase: ", "") : "Google sign-in failed.";
}
