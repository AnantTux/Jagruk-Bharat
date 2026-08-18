"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteFooter } from "@/components/site-footer";
import { INDIA_REGIONS } from "@/lib/india-regions";
import { getFirebaseAuth } from "@/lib/firebase-client";

function nameParts(displayName, email) {
    const parts = (displayName || email?.split("@")[0] || "Jagruk User").trim().split(/\s+/);
    return { firstName: parts[0], lastName: parts.slice(1).join(" ") || "User" };
}

export default function CompleteProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState({ firstName: "", lastName: "", region: "", notificationsEnabled: false });
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
        const user = getFirebaseAuth().currentUser;
        if (!user) { router.replace("/login"); return; }
        const timer = setTimeout(() => setProfile((current) => ({ ...current, ...nameParts(user.displayName, user.email) })), 0);
        return () => clearTimeout(timer);
    }, [router]);
    async function submit(event) {
        event.preventDefault(); setSubmitting(true); setMessage("");
        try {
            const user = getFirebaseAuth().currentUser;
            if (!user) throw new Error("Google sign-in expired. Please try again.");
            const response = await fetch("/api/auth/firebase/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: await user.getIdToken(true), ...profile }) });
            const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not complete your profile.");
            router.push(new URLSearchParams(window.location.search).get("next") === "/report" ? "/report" : "/dashboard"); router.refresh();
        } catch (error) { setMessage(error instanceof Error ? error.message : "Could not complete your profile."); }
        finally { setSubmitting(false); }
    }
    return <div className="flex min-h-screen flex-col bg-background text-foreground">
        <AppHeader showDashboard={false} />
        <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
            <Card className="w-full max-w-md border-border bg-white">
                <CardHeader><p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">One last step</p><CardTitle className="font-display text-[2rem] leading-[1.2]">Complete your profile</CardTitle><CardDescription>Google securely provided your name and verified email. Choose your state for local safety updates.</CardDescription></CardHeader>
                <CardContent><form onSubmit={submit} className="space-y-5">{message && <p role="alert" className="rounded-[var(--radius-control)] border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{message}</p>}<div><Label htmlFor="firstName">First name</Label><Input id="firstName" required value={profile.firstName} onChange={(event) => setProfile({ ...profile, firstName: event.target.value })} /></div><div><Label htmlFor="lastName">Last name</Label><Input id="lastName" required value={profile.lastName} onChange={(event) => setProfile({ ...profile, lastName: event.target.value })} /></div><div><Label htmlFor="region">State or Union Territory</Label><select id="region" required value={profile.region} onChange={(event) => setProfile({ ...profile, region: event.target.value })} className="mt-2 h-11 w-full rounded-[var(--radius-control)] border border-input bg-white px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-[3px] focus:ring-primary/20"><option value="">Select your state</option>{INDIA_REGIONS.map((region) => <option key={region.value} value={region.value}>{region.label}</option>)}</select></div><label className="flex gap-2 text-sm text-secondary"><input type="checkbox" checked={profile.notificationsEnabled} onChange={(event) => setProfile({ ...profile, notificationsEnabled: event.target.checked })} className="accent-primary" /> Send regional hazard-alert emails</label><Button disabled={submitting} size="lg" className="w-full">{submitting ? "Saving…" : "Continue to dashboard"}</Button></form></CardContent>
            </Card>
        </main>
        <SiteFooter compact />
    </div>;
}
