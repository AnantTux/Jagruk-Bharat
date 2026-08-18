"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MailCheck, ShieldCheck, UserPlus } from "lucide-react";
import { createUserWithEmailAndPassword, GoogleAuthProvider, sendEmailVerification, signInWithPopup, signOut, updateProfile } from "firebase/auth";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteFooter } from "@/components/site-footer";
import { INDIA_REGIONS } from "@/lib/india-regions";
import { getFirebaseAuth } from "@/lib/firebase-client";

const selectClass = "mt-2 h-11 w-full rounded-[var(--radius-control)] border border-input bg-white px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-[3px] focus:ring-primary/20";

export default function SignupPage() {
    const router = useRouter();
    const [verificationSent, setVerificationSent] = useState(false);
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => { document.body.classList.add("auth-page-active"); return () => document.body.classList.remove("auth-page-active"); }, []);

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
            const result = await signInWithPopup(getFirebaseAuth(), provider);
            const response = await fetch("/api/auth/firebase/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: await result.user.getIdToken(true) }) });
            const data = await response.json();
            if (data.requiresProfile) { router.push("/complete-profile"); return; }
            if (!response.ok) throw new Error(data.error || "Unable to create your session.");
            router.push("/dashboard");
            router.refresh();
        } catch (googleError) { setError(googleSignInMessage(googleError)); } finally { setSubmitting(false); }
    }

    return <div className="flex min-h-screen flex-col bg-background text-foreground">
        <AppHeader showDashboard={false} />
        <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
            <div className="w-full max-w-xl">
                <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-[#0e539d]"><ArrowLeft className="h-4 w-4" /> Back to Home</Link>
                <Card className="border-border bg-white">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[var(--radius-control)] bg-primary-soft"><ShieldCheck className="h-7 w-7 text-primary" /></div>
                        <CardTitle className="font-display text-[2rem] leading-[1.2] text-foreground">{verificationSent ? "Verify your email" : "Join Jagruk Bharat"}</CardTitle>
                        <CardDescription>{verificationSent ? `We sent a verification link to ${email}.` : "Create a verified account to report public hazards."}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {verificationSent ? <div className="space-y-4 text-center">
                            <div className="rounded-[var(--radius-control)] border border-border bg-subtle p-4 text-sm text-secondary"><MailCheck className="mx-auto mb-2 h-6 w-6 text-success" />Open the email from Firebase, click its verification link, then return here and sign in. Check spam/junk if it is not in your inbox.</div>
                            <Button className="w-full" size="lg" onClick={() => router.push("/login")}>Go to Sign In</Button>
                        </div> : <div className="space-y-4">
                            {error && <p role="alert" className="rounded-[var(--radius-control)] border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
                            <Button type="button" disabled={submitting} onClick={() => void joinWithGoogle()} variant="outline" size="lg" className="w-full"><span className="font-bold text-primary">G</span>Continue with Google</Button>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or join with email<span className="h-px flex-1 bg-border" /></div>
                            <form onSubmit={createAccount} className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="firstName">First Name</Label><Input id="firstName" name="firstName" required maxLength={80} /></div><div><Label htmlFor="lastName">Last Name</Label><Input id="lastName" name="lastName" required maxLength={80} /></div></div>
                                <div><Label htmlFor="email">Email Address</Label><Input id="email" name="email" type="email" autoComplete="email" required /></div>
                                <div><Label htmlFor="region">State or Union Territory</Label><select id="region" name="region" required className={selectClass}><option value="">Select a region</option>{INDIA_REGIONS.map((region) => <option key={region.value} value={region.value}>{region.label}</option>)}</select></div>
                                <div><Label htmlFor="role">Role</Label><select id="role" name="role" className={selectClass}><option value="citizen">Concerned Citizen</option><option value="first-responder">First Responder</option><option value="public-safety">Public Safety Professional</option><option value="researcher">Researcher</option><option value="other">Other</option></select></div>
                                <div><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required /><p className="mt-1 text-xs text-muted-foreground">Use at least 8 characters with a letter and number.</p></div>
                                <div><Label htmlFor="confirmPassword">Confirm Password</Label><Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required /></div>
                                <label className="flex gap-2 text-sm text-secondary"><input type="checkbox" name="notificationsEnabled" className="accent-primary" /> Send me regional hazard-alert emails</label>
                                <Button disabled={submitting} size="lg" className="w-full"><UserPlus className="h-4 w-4" /> {submitting ? "Creating…" : "Create Account"}</Button>
                            </form>
                        </div>}
                        <p className="mt-6 text-center text-sm text-muted-foreground">Already registered? <Link href="/login" className="font-semibold text-primary hover:text-[#0e539d]">Sign in</Link></p>
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
