"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MailCheck, ShieldCheck, UserPlus } from "lucide-react";
import { createUserWithEmailAndPassword, getRedirectResult, GoogleAuthProvider, sendEmailVerification, signInWithRedirect, signOut, updateProfile } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteFooter } from "@/components/site-footer";
import { INDIA_REGIONS } from "@/lib/india-regions";
import { getFirebaseAuth } from "@/lib/firebase-client";

const inputClass = "h-11 border-slate-600 bg-slate-700 text-white";

export default function SignupPage() {
    const router = useRouter();
    const [verificationSent, setVerificationSent] = useState(false);
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => { document.body.classList.add("auth-page-active"); return () => document.body.classList.remove("auth-page-active"); }, []);

    const completeGoogleAccount = useCallback(async (user) => {
        const response = await fetch("/api/auth/firebase/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: await user.getIdToken(true) }) });
        const data = await response.json();
        if (data.requiresProfile) { router.push("/complete-profile"); return; }
        if (!response.ok) throw new Error(data.error || "Unable to create your session.");
        router.push("/dashboard");
        router.refresh();
    }, [router]);

    useEffect(() => { let active = true; void getRedirectResult(getFirebaseAuth()).then(async (result) => { if (!result || !active) return; setSubmitting(true); await completeGoogleAccount(result.user); }).catch((googleError) => { if (active) setError(googleSignInMessage(googleError)); }).finally(() => { if (active) setSubmitting(false); }); return () => { active = false; }; }, [completeGoogleAccount]);

    async function createAccount(event) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        if (form.get("password") !== form.get("confirmPassword")) {
            setError("Passwords do not match.");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            const firstName = String(form.get("firstName")).trim();
            const lastName = String(form.get("lastName")).trim();
            const account = await createUserWithEmailAndPassword(getFirebaseAuth(), String(form.get("email")), String(form.get("password")));
            await updateProfile(account.user, { displayName: `${firstName} ${lastName}` });
            const profileResponse = await fetch("/api/auth/firebase/profile", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idToken: await account.user.getIdToken(), firstName, lastName,
                    region: form.get("region"), role: form.get("role"), notificationsEnabled: form.get("notificationsEnabled") === "on",
                }),
            });
            const profileData = await profileResponse.json();
            if (!profileResponse.ok)
                throw new Error(profileData.error || "Unable to save your account profile.");
            await sendEmailVerification(account.user);
            await signOut(getFirebaseAuth());
            setEmail(String(form.get("email")));
            setVerificationSent(true);
        }
        catch (signupError) {
            setError(signupError instanceof Error ? signupError.message.replace("Firebase: ", "") : "Unable to create account.");
        }
        finally { setSubmitting(false); }
    }

    async function joinWithGoogle() {
        setSubmitting(true);
        setError("");
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: "select_account" });
            await signInWithRedirect(getFirebaseAuth(), provider);
        } catch (googleError) { setError(googleSignInMessage(googleError)); setSubmitting(false); }
    }

    return <div className="flex min-h-screen flex-col bg-slate-900"><main className="flex flex-1 items-center justify-center p-4 py-10"><div className="w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center text-sm text-slate-400 hover:text-white"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        <Card className="border-slate-700 bg-slate-800/90 shadow-lg"><CardHeader className="text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400"><ShieldCheck className="h-7 w-7 text-slate-800" /></div><CardTitle className="text-2xl text-white">{verificationSent ? "Verify your email" : "Join Jagruk Bharat"}</CardTitle><CardDescription className="text-slate-300">{verificationSent ? `We sent a verification link to ${email}.` : "Create a verified account to report public hazards."}</CardDescription></CardHeader><CardContent>
            {verificationSent ? <div className="space-y-4 text-center"><div className="rounded-md bg-slate-700 p-4 text-sm text-slate-200"><MailCheck className="mx-auto mb-2 h-6 w-6 text-amber-400" />Open the email from Firebase, click its verification link, then return here and sign in. Check spam/junk if it is not in your inbox.</div><Button className="w-full bg-amber-400 text-slate-900 hover:bg-amber-500" onClick={() => router.push("/login")}>Go to Sign In</Button></div> : <><div className="space-y-4">
                {error && <p role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
                <Button type="button" disabled={submitting} onClick={() => void joinWithGoogle()} variant="outline" className="h-11 w-full border-blue-300 bg-white text-slate-800 hover:bg-blue-50"><span className="mr-2 font-bold text-blue-600">G</span>Continue with Google</Button>
                <div className="flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-600" />or join with email<span className="h-px flex-1 bg-slate-600" /></div>
                <form onSubmit={createAccount} className="space-y-4">
                <div className="grid grid-cols-2 gap-3"><div><Label htmlFor="firstName" className="text-white">First Name</Label><Input id="firstName" name="firstName" required maxLength={80} className={inputClass} /></div><div><Label htmlFor="lastName" className="text-white">Last Name</Label><Input id="lastName" name="lastName" required maxLength={80} className={inputClass} /></div></div>
                <div><Label htmlFor="email" className="text-white">Email Address</Label><Input id="email" name="email" type="email" autoComplete="email" required className={inputClass} /></div>
                <div><Label htmlFor="region" className="text-white">State or Union Territory</Label><select id="region" name="region" required className={`${inputClass} w-full rounded-md px-3`}><option value="">Select a region</option>{INDIA_REGIONS.map((region) => <option key={region.value} value={region.value}>{region.label}</option>)}</select></div>
                <div><Label htmlFor="role" className="text-white">Role</Label><select id="role" name="role" className={`${inputClass} w-full rounded-md px-3`}><option value="citizen">Concerned Citizen</option><option value="first-responder">First Responder</option><option value="public-safety">Public Safety Professional</option><option value="researcher">Researcher</option><option value="other">Other</option></select></div>
                <div><Label htmlFor="password" className="text-white">Password</Label><Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className={inputClass} /><p className="mt-1 text-xs text-slate-400">Use at least 8 characters with a letter and number.</p></div>
                <div><Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label><Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required className={inputClass} /></div>
                <label className="flex gap-2 text-sm text-slate-300"><input type="checkbox" name="notificationsEnabled" className="accent-amber-400" /> Send me regional hazard-alert emails</label>
                <Button disabled={submitting} className="h-11 w-full bg-amber-400 text-slate-900 hover:bg-amber-500"><UserPlus className="mr-2 h-4 w-4" /> {submitting ? "Creating…" : "Create Account"}</Button>
                </form></div></>}
            <p className="mt-6 text-center text-sm text-slate-400">Already registered? <Link href="/login" className="font-medium text-amber-400">Sign in</Link></p>
        </CardContent></Card></div></main><SiteFooter compact /></div>;
}

function googleSignInMessage(error) {
    const code = typeof error === "object" && error && "code" in error ? error.code : "";
    if (code === "auth/operation-not-allowed") return "Google sign-in has not been enabled for this Firebase project yet.";
    if (code === "auth/unauthorized-domain") return "This website address is not authorised for Google sign-in in Firebase yet.";
    if (code === "auth/internal-error") return "Google sign-in could not finish. Please return to this page and try again.";
    return error instanceof Error ? error.message.replace("Firebase: ", "") : "Google sign-in failed.";
}
