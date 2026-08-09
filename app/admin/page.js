"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Flag, RefreshCw, Search, Settings2, ShieldCheck, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthNav } from "@/components/auth-nav";
import { SiteBrand } from "@/components/site-brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const roles = ["citizen", "responder", "moderator", "admin"];

export default function AdminPage() {
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [flags, setFlags] = useState([]);
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);
    const [sampleDataVisible, setSampleDataVisible] = useState(true);

    const loadFlags = useCallback(async () => {
        const response = await fetch("/api/admin/moderation", { cache: "no-store" });
        if (response.status === 403) {
            router.replace("/dashboard");
            return;
        }
        const data = await response.json();
        setFlags(data.flags ?? []);
    }, [router]);

    const loadSampleDataSetting = useCallback(async () => {
        const response = await fetch("/api/admin/settings/sample-data", { cache: "no-store" });
        const data = await response.json();
        if (response.ok) setSampleDataVisible(data.sampleDataVisible);
    }, []);

    useEffect(() => {
        let active = true;
        void fetch("/api/auth/session", { cache: "no-store" })
            .then((response) => response.json())
            .then(async (data) => {
                if (!active) return;
                if (data.user?.role !== "admin") {
                    router.replace("/login?next=/admin");
                    return;
                }
                setReady(true);
                await Promise.all([loadFlags(), loadSampleDataSetting()]);
            })
            .catch(() => router.replace("/login?next=/admin"));
        return () => { active = false; };
    }, [loadFlags, loadSampleDataSetting, router]);

    async function toggleSampleData() {
        setBusy(true);
        setMessage("");
        try {
            const response = await fetch("/api/admin/settings/sample-data", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sampleDataVisible: !sampleDataVisible }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error ?? "Could not update sample data visibility.");
            setSampleDataVisible(data.sampleDataVisible);
            setMessage(data.sampleDataVisible ? "Sample hazards are visible on the public map and analytics." : "Sample hazards are hidden from the public map and analytics.");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Could not update sample data visibility.");
        } finally {
            setBusy(false);
        }
    }

    async function searchUsers(event) {
        event.preventDefault();
        setMessage("");
        if (query.trim().length < 2) {
            setUsers([]);
            setMessage("Enter at least two characters to search users.");
            return;
        }
        const response = await fetch(`/api/admin/users?q=${encodeURIComponent(query)}`, { cache: "no-store" });
        const data = await response.json();
        setUsers(data.users ?? []);
        if (!response.ok) setMessage(data.error ?? "Could not search users.");
    }

    async function changeRole(userId, role) {
        setBusy(true);
        setMessage("");
        try {
            const response = await fetch(`/api/admin/users/${userId}/role`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error ?? "Could not update the role.");
            setUsers((current) => current.map((user) => user.id === userId ? { ...user, role: data.user.role } : user));
            setMessage("Role updated and recorded in the audit log.");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Could not update the role.");
        } finally {
            setBusy(false);
        }
    }

    async function reviewFlag(flagId, decision) {
        setBusy(true);
        setMessage("");
        try {
            const response = await fetch("/api/admin/moderation", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ flagId, decision }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error ?? "Could not review this report.");
            setFlags((current) => current.filter((flag) => flag._id !== flagId));
            setMessage(`Moderation decision saved: ${decision}.`);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Could not review this report.");
        } finally {
            setBusy(false);
        }
    }

    if (!ready) return <main className="min-h-screen bg-slate-50" />;

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <header className="border-b border-blue-900 bg-[#1264b9] text-white">
                <div className="mx-auto flex min-h-[88px] max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
                    <SiteBrand light subtitle="Administration" />
                    <nav aria-label="Primary" className="flex items-center gap-2"><AuthNav light /></nav>
                </div>
                <div className="h-2 bg-[#78be4c]" />
            </header>

            <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
                <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3"><span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700"><ShieldCheck className="h-6 w-6" /></span><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Administration</p><h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Safety operations</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Manage demonstration data, user access, and reports that need moderation. All role and moderation changes are recorded.</p></div></div>
                        <Button variant="outline" className="border-blue-200 text-blue-800 hover:bg-blue-50" asChild><Link href="/dashboard">Return to map</Link></Button>
                    </div>
                </div>

                {message && <p role="status" className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950">{message}</p>}

                <section className="mt-6 grid gap-5 lg:grid-cols-2">
                    <article className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                        <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><Settings2 className="h-5 w-5 text-blue-700" /><h2 className="text-lg font-bold text-slate-950">Sample data</h2></div><p className="mt-2 max-w-md text-sm leading-6 text-slate-600">The 60 labelled sample hazards can be shown for demonstrations or hidden from the public map and analytics without being deleted.</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${sampleDataVisible ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>{sampleDataVisible ? "Visible" : "Hidden"}</span></div>
                        <Button disabled={busy} onClick={() => void toggleSampleData()} className="mt-5 bg-blue-700 text-white hover:bg-blue-800">{sampleDataVisible ? "Hide sample data" : "Show sample data"}</Button>
                    </article>

                    <article className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-2"><span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700"><Users className="h-5 w-5" /></span><div><h2 className="text-lg font-bold text-slate-950">User roles</h2><p className="text-sm text-slate-600">Find an account and assign the appropriate access level.</p></div></div>
                        <form onSubmit={searchUsers} className="mt-5 flex flex-col gap-2 sm:flex-row"><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or email" className="border-slate-300 bg-white text-slate-950 placeholder:text-slate-500" /><Button disabled={busy} type="submit" className="bg-blue-700 text-white hover:bg-blue-800"><Search className="mr-1 h-4 w-4" /> Search</Button></form>
                        <div className="mt-4 space-y-3">{users.map((user) => <div key={user.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate font-semibold text-slate-900">{user.firstName} {user.lastName}</p><p className="mt-1 truncate text-sm text-slate-600">{user.email} · {user.region || "No state recorded"}</p></div><Select value={user.role} disabled={busy} onValueChange={(role) => void changeRole(user.id, role)}><SelectTrigger className="w-full border-slate-300 bg-white text-slate-900 sm:w-40"><SelectValue /></SelectTrigger><SelectContent>{roles.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent></Select></div></div>)}</div>
                    </article>
                </section>

                <section className="mt-6 rounded-2xl border border-blue-100 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-6"><div className="flex items-center gap-3"><span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-700"><Flag className="h-5 w-5" /></span><div><h2 className="text-lg font-bold text-slate-950">Open moderation queue</h2><p className="text-sm text-slate-600">Review reports flagged by the community.</p></div></div><Button variant="outline" size="sm" className="border-blue-200 text-blue-800 hover:bg-blue-50" onClick={() => void loadFlags()} aria-label="Refresh moderation queue"><RefreshCw className="h-4 w-4" /></Button></div>
                    <div className="divide-y divide-slate-200">{flags.length === 0 && <p className="p-6 text-sm text-slate-600">No open flags. New moderation reports will appear here.</p>}{flags.map((flag) => <article key={flag._id} className="p-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><p className="font-semibold capitalize text-slate-900">{flag.reason}</p><p className="mt-1 text-sm text-slate-600">Hazard reference: {flag.hazardId}</p>{flag.details && <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700">{flag.details}</p>}</div><div className="flex flex-wrap gap-2"><Button size="sm" disabled={busy} onClick={() => void reviewFlag(flag._id, "hide")} variant="destructive">Hide report</Button><Button size="sm" disabled={busy} onClick={() => void reviewFlag(flag._id, "reject")} variant="outline" className="border-slate-300 text-slate-800 hover:bg-slate-100">Reject</Button><Button size="sm" disabled={busy} onClick={() => void reviewFlag(flag._id, "dismiss")} variant="ghost" className="text-blue-800 hover:bg-blue-50">Dismiss</Button></div></div></article>)}</div>
                </section>
            </div>
        </main>
    );
}
