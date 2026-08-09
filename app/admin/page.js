"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Users, Flag, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

    const loadFlags = useCallback(async () => {
        const response = await fetch("/api/admin/moderation", { cache: "no-store" });
        if (response.status === 403) {
            router.replace("/dashboard");
            return;
        }
        const data = await response.json();
        setFlags(data.flags ?? []);
    }, [router]);

    useEffect(() => {
        let active = true;
        void fetch("/api/auth/session", { cache: "no-store" })
            .then((response) => response.json())
            .then(async (data) => {
                if (!active)
                    return;
                if (data.user?.role !== "admin") {
                    router.replace("/login?next=/admin");
                    return;
                }
                setReady(true);
                await loadFlags();
            })
            .catch(() => router.replace("/login?next=/admin"));
        return () => { active = false; };
    }, [loadFlags, router]);

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
        if (!response.ok)
            setMessage(data.error ?? "Could not search users.");
    }

    async function changeRole(userId, role) {
        setBusy(true);
        setMessage("");
        try {
            const response = await fetch(`/api/admin/users/${userId}/role`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role }),
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.error ?? "Could not update the role.");
            setUsers((current) => current.map((user) => user.id === userId ? { ...user, role: data.user.role } : user));
            setMessage("Role updated and recorded in the audit log.");
        }
        catch (error) {
            setMessage(error instanceof Error ? error.message : "Could not update the role.");
        }
        finally { setBusy(false); }
    }

    async function reviewFlag(flagId, decision) {
        setBusy(true);
        setMessage("");
        try {
            const response = await fetch("/api/admin/moderation", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ flagId, decision }),
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.error ?? "Could not review this report.");
            setFlags((current) => current.filter((flag) => flag._id !== flagId));
            setMessage(`Moderation decision saved: ${decision}.`);
        }
        catch (error) {
            setMessage(error instanceof Error ? error.message : "Could not review this report.");
        }
        finally { setBusy(false); }
    }

    if (!ready)
        return <main className="min-h-screen bg-slate-900" />;

    return <main className="min-h-screen bg-slate-900 p-4 text-white md:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-5">
                <div className="flex items-center gap-3"><ShieldCheck className="h-9 w-9 text-amber-400" /><div><h1 className="text-2xl font-bold">Administration</h1><p className="text-sm text-slate-400">Role management and community safety moderation</p></div></div>
                <Button variant="outline" className="border-slate-600 bg-slate-800 text-white" asChild><Link href="/dashboard">Return to map</Link></Button>
            </header>
            {message && <p role="status" className="rounded-md border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">{message}</p>}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-slate-700 bg-slate-800"><CardHeader><CardTitle className="flex items-center gap-2 text-white"><Users className="h-5 w-5 text-amber-400" />User roles</CardTitle></CardHeader><CardContent className="space-y-4">
                    <form onSubmit={searchUsers} className="flex gap-2"><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or email" className="border-slate-600 bg-slate-700 text-white" /><Button disabled={busy} type="submit" className="bg-amber-400 text-slate-900 hover:bg-amber-500"><Search className="mr-1 h-4 w-4" />Search</Button></form>
                    <div className="space-y-3">{users.map((user) => <div key={user.id} className="rounded-md border border-slate-700 bg-slate-900/60 p-3"><p className="font-medium">{user.firstName} {user.lastName}</p><p className="mb-2 text-sm text-slate-400">{user.email} · {user.region}</p><Select value={user.role} disabled={busy} onValueChange={(role) => void changeRole(user.id, role)}><SelectTrigger className="border-slate-600 bg-slate-700 text-white"><SelectValue /></SelectTrigger><SelectContent>{roles.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent></Select></div>)}</div>
                </CardContent></Card>
                <Card className="border-slate-700 bg-slate-800"><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2 text-white"><Flag className="h-5 w-5 text-amber-400" />Open moderation queue</CardTitle><Button variant="ghost" size="sm" onClick={() => void loadFlags()}><RefreshCw className="h-4 w-4" /></Button></CardHeader><CardContent className="space-y-3">
                    {flags.length === 0 && <p className="text-sm text-slate-400">No open flags.</p>}
                    {flags.map((flag) => <div key={flag._id} className="rounded-md border border-slate-700 bg-slate-900/60 p-3"><p className="font-medium capitalize">{flag.reason}</p><p className="text-sm text-slate-400">Hazard: {flag.hazardId}</p>{flag.details && <p className="mt-2 text-sm text-slate-300">{flag.details}</p>}<div className="mt-3 flex gap-2"><Button size="sm" disabled={busy} onClick={() => void reviewFlag(flag._id, "hide")} variant="destructive">Hide</Button><Button size="sm" disabled={busy} onClick={() => void reviewFlag(flag._id, "reject")} variant="outline" className="border-slate-600 text-white">Reject</Button><Button size="sm" disabled={busy} onClick={() => void reviewFlag(flag._id, "dismiss")} variant="ghost">Dismiss</Button></div></div>)}
                </CardContent></Card>
            </div>
        </div>
    </main>;
}
