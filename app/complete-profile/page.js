"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    return <main className="min-h-screen bg-slate-50 p-5 text-slate-900"><form onSubmit={submit} className="mx-auto mt-16 max-w-md space-y-5 rounded-xl border border-blue-200 bg-white p-6 shadow-sm"><div><p className="text-sm font-bold uppercase tracking-wide text-blue-600">One last step</p><h1 className="mt-1 text-2xl font-bold">Complete your profile</h1><p className="mt-2 text-sm text-slate-600">Google securely provided your name and verified email. Choose your state for local safety updates.</p></div>{message && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{message}</p>}<div><Label htmlFor="firstName">First name</Label><Input id="firstName" required value={profile.firstName} onChange={(event) => setProfile({ ...profile, firstName: event.target.value })} /></div><div><Label htmlFor="lastName">Last name</Label><Input id="lastName" required value={profile.lastName} onChange={(event) => setProfile({ ...profile, lastName: event.target.value })} /></div><div><Label htmlFor="region">State or Union Territory</Label><select id="region" required value={profile.region} onChange={(event) => setProfile({ ...profile, region: event.target.value })} className="mt-2 h-10 w-full rounded-md border border-blue-200 bg-white px-3"><option value="">Select your state</option>{INDIA_REGIONS.map((region) => <option key={region.value} value={region.value}>{region.label}</option>)}</select></div><label className="flex gap-2 text-sm text-slate-700"><input type="checkbox" checked={profile.notificationsEnabled} onChange={(event) => setProfile({ ...profile, notificationsEnabled: event.target.checked })} /> Send regional hazard-alert emails</label><Button disabled={submitting} className="w-full bg-blue-600 text-white hover:bg-blue-500">{submitting ? "Saving…" : "Continue to dashboard"}</Button></form></main>;
}
