"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteFooter } from "@/components/site-footer";
import { INDIA_REGIONS } from "@/lib/india-regions";

const inputClass = "h-11 border-slate-600 bg-slate-700 text-white";

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [verificationMode, setVerificationMode] = useState(false);
    const [developmentCode, setDevelopmentCode] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

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
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: form.get("firstName"), lastName: form.get("lastName"), email: form.get("email"),
                    region: form.get("region"), role: form.get("role"), password: form.get("password"),
                    notificationsEnabled: form.get("notificationsEnabled") === "on",
                }),
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.error || "Unable to create account.");
            setEmail(String(form.get("email")));
            setDevelopmentCode(data.developmentCode || "");
            setMessage(data.message);
            setVerificationMode(true);
        }
        catch (signupError) {
            setError(signupError instanceof Error ? signupError.message : "Unable to create account.");
        }
        finally {
            setSubmitting(false);
        }
    }

    async function verifyEmail(event) {
        event.preventDefault();
        const code = new FormData(event.currentTarget).get("code");
        setSubmitting(true);
        setError("");
        try {
            const response = await fetch("/api/auth/verify-email", {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code }),
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.error || "Verification failed.");
            router.push("/dashboard");
            router.refresh();
        }
        catch (verifyError) {
            setError(verifyError instanceof Error ? verifyError.message : "Verification failed.");
        }
        finally {
            setSubmitting(false);
        }
    }

    return <div className="flex min-h-screen flex-col bg-slate-900">
        <main className="flex flex-1 items-center justify-center p-4 py-10">
            <div className="w-full max-w-md">
                <Link href="/" className="mb-6 inline-flex items-center text-sm text-slate-400 hover:text-white"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
                <Card className="border-slate-700 bg-slate-800/90 shadow-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400"><ShieldCheck className="h-7 w-7 text-slate-800" /></div>
                        <CardTitle className="text-2xl text-white">{verificationMode ? "Verify your email" : "Join Jagruk Bharat"}</CardTitle>
                        <CardDescription className="text-slate-300">{verificationMode ? `Enter the code sent to ${email}.` : "Create a verified account to report public hazards."}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {verificationMode ? <form onSubmit={verifyEmail} className="space-y-4">
                            {message && <p className="rounded-md bg-slate-700 p-3 text-sm text-slate-200">{message}</p>}
                            {developmentCode && <p className="rounded-md border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-200">Development code: <strong>{developmentCode}</strong></p>}
                            {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
                            <Label htmlFor="code" className="text-white">Six-digit code</Label>
                            <Input id="code" name="code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required className={inputClass} />
                            <Button disabled={submitting} className="w-full bg-amber-400 text-slate-900 hover:bg-amber-500">{submitting ? "Verifying…" : "Verify and Continue"}</Button>
                        </form> : <form onSubmit={createAccount} className="space-y-4">
                            {error && <p role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
                            <div className="grid grid-cols-2 gap-3">
                                <div><Label htmlFor="firstName" className="text-white">First Name</Label><Input id="firstName" name="firstName" required maxLength={80} className={inputClass} /></div>
                                <div><Label htmlFor="lastName" className="text-white">Last Name</Label><Input id="lastName" name="lastName" required maxLength={80} className={inputClass} /></div>
                            </div>
                            <div><Label htmlFor="email" className="text-white">Email Address</Label><Input id="email" name="email" type="email" autoComplete="email" required className={inputClass} /></div>
                            <div><Label htmlFor="region" className="text-white">State or Union Territory</Label><select id="region" name="region" required className={`${inputClass} w-full rounded-md px-3`}><option value="">Select a region</option>{INDIA_REGIONS.map((region) => <option key={region.value} value={region.value}>{region.label}</option>)}</select></div>
                            <div><Label htmlFor="role" className="text-white">Role</Label><select id="role" name="role" className={`${inputClass} w-full rounded-md px-3`}><option value="citizen">Concerned Citizen</option><option value="first-responder">First Responder</option><option value="public-safety">Public Safety Professional</option><option value="researcher">Researcher</option><option value="other">Other</option></select></div>
                            <div><Label htmlFor="password" className="text-white">Password</Label><Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className={inputClass} /><p className="mt-1 text-xs text-slate-400">Use at least 8 characters with a letter and number.</p></div>
                            <div><Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label><Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required className={inputClass} /></div>
                            <label className="flex gap-2 text-sm text-slate-300"><input type="checkbox" name="notificationsEnabled" className="accent-amber-400" /> Send me regional hazard-alert emails</label>
                            <Button disabled={submitting} className="h-11 w-full bg-amber-400 text-slate-900 hover:bg-amber-500"><UserPlus className="mr-2 h-4 w-4" /> {submitting ? "Creating…" : "Create Account"}</Button>
                        </form>}
                        <p className="mt-6 text-center text-sm text-slate-400">Already registered? <Link href="/login" className="font-medium text-amber-400">Sign in</Link></p>
                    </CardContent>
                </Card>
            </div>
        </main>
        <SiteFooter compact />
    </div>;
}
