"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Flag, RefreshCw, Search, Settings2, ShieldCheck, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
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
        <div className="min-h-screen bg-background text-slate-950">
            <AppHeader subtitle="Administration" />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                <section className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex items-start gap-4">
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-primary/30 bg-[#e1effb] text-primary"><ShieldCheck className="h-6 w-6" aria-hidden="true" /></span>
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">Administration</p>
                            <h1 className="mt-1 text-[2rem] font-bold leading-10 tracking-[-0.03em] text-slate-950 sm:text-4xl sm:leading-[2.75rem]">Safety operations</h1>
                            <p className="mt-3 max-w-2xl text-base leading-6 text-slate-600">Manage demonstration data, user access, and reports that need moderation. All role and moderation changes are recorded.</p>
                        </div>
                    </div>
                    <Button variant="outline" asChild><Link href="/dashboard">Return to map</Link></Button>
                </section>

                {message ? <p role="status" className="mt-6 rounded-[var(--radius-control)] border border-primary/30 bg-[#e1effb] px-4 py-3 text-sm font-semibold text-[#093f78]">{message}</p> : null}

                <section className="mt-6 grid gap-6 lg:grid-cols-2">
                    <Card className="gap-0 py-0">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2"><Settings2 className="h-5 w-5 text-primary" aria-hidden="true" /><h2 className="text-lg font-bold text-slate-950">Sample data</h2></div>
                                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">The 60 labelled sample hazards can be shown for demonstrations or hidden from the public map and analytics without being deleted.</p>
                                </div>
                                <span className={`rounded-[var(--radius-control)] px-3 py-1 text-xs font-bold ${sampleDataVisible ? "bg-[#f0fdf4] text-[#15803d]" : "bg-slate-100 text-slate-700"}`}>{sampleDataVisible ? "Visible" : "Hidden"}</span>
                            </div>
                            <Button disabled={busy} onClick={() => void toggleSampleData()} className="mt-5">{sampleDataVisible ? "Hide sample data" : "Show sample data"}</Button>
                        </CardContent>
                    </Card>

                    <Card className="gap-0 py-0">
                        <CardHeader className="border-b border-border p-6">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] bg-[#e1effb] text-primary"><Users className="h-5 w-5" aria-hidden="true" /></span>
                                <div><h2 className="text-lg font-bold text-slate-950">User roles</h2><p className="text-sm text-slate-600">Find an account and assign the appropriate access level.</p></div>
                            </div>
                            <form onSubmit={searchUsers} className="mt-5 flex flex-col gap-2 sm:flex-row"><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or email" /><Button disabled={busy} type="submit"><Search className="h-4 w-4" aria-hidden="true" />Search</Button></form>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border px-6">{users.map((user) => <div key={user.id} className="py-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate font-semibold text-slate-950">{user.firstName} {user.lastName}</p><p className="mt-1 truncate text-sm text-slate-600">{user.email} · {user.region || "No state recorded"}</p></div><Select value={user.role} disabled={busy} onValueChange={(role) => void changeRole(user.id, role)}><SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger><SelectContent>{roles.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent></Select></div></div>)}</div>
                        </CardContent>
                    </Card>
                </section>

                <Card className="mt-6 gap-0 py-0">
                    <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-border p-6">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] bg-[#fffbeb] text-[#d97706]"><Flag className="h-5 w-5" aria-hidden="true" /></span>
                            <div><h2 className="text-lg font-bold text-slate-950">Open moderation queue</h2><p className="text-sm text-slate-600">Review reports flagged by the community.</p></div>
                        </div>
                        <Button variant="outline" size="icon" onClick={() => void loadFlags()} aria-label="Refresh moderation queue"><RefreshCw className="h-4 w-4" aria-hidden="true" /></Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        {flags.length === 0 ? <EmptyState icon={Flag} message="No open flags. New moderation reports will appear here." className="m-6" /> : null}
                        <div className="divide-y divide-border">{flags.map((flag) => <article key={flag._id} className="p-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><p className="font-semibold capitalize text-slate-950">{flag.reason}</p><p className="mt-1 font-mono text-xs text-slate-600">Hazard reference: {flag.hazardId}</p>{flag.details ? <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700">{flag.details}</p> : null}</div><div className="flex flex-wrap gap-2"><Button size="sm" disabled={busy} onClick={() => void reviewFlag(flag._id, "hide")} variant="destructive">Hide report</Button><Button size="sm" disabled={busy} onClick={() => void reviewFlag(flag._id, "reject")} variant="outline">Reject</Button><Button size="sm" disabled={busy} onClick={() => void reviewFlag(flag._id, "dismiss")} variant="outline">Dismiss</Button></div></div></article>)}</div>
                    </CardContent>
                </Card>
            </main>

            <SiteFooter />
        </div>
    );
}
