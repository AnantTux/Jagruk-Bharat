"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Download, Map, RefreshCw, ShieldAlert, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTimeAgo, hazardTypeLabel } from "@/lib/hazard-utils";

const blank = { active: 0, emergency: 0, highSeverity: 0, adminApproved: 0, communityVotes: 0 };

export default function HazardAnalytics() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    async function load() {
        setLoading(true); setError("");
        try { const response = await fetch("/api/analytics", { cache: "no-store" }); const body = await response.json(); if (!response.ok) throw new Error(body.error); setData(body); }
        catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Unable to load analytics."); }
        finally { setLoading(false); }
    }
    useEffect(() => { const timer = setTimeout(() => { void load(); }, 0); return () => clearTimeout(timer); }, []);
    const summary = data?.summary ?? blank;
    const largestType = Math.max(1, ...(data?.byType?.map((item) => item.count) ?? [1]));
    return <main className="min-h-screen bg-slate-950 text-white">
        <header className="border-b border-blue-900 bg-slate-950/90"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-300">Jagruk Bharat</p><h1 className="text-2xl font-black">Hazard analytics</h1><p className="mt-1 text-sm text-slate-400">Live figures from published public hazard reports.</p></div><div className="flex gap-2"><Button variant="outline" className="border-blue-700 bg-blue-950/50 text-white hover:bg-blue-900" asChild><a href="/api/analytics/export"><Download className="mr-2 h-4 w-4" /> Export CSV</a></Button><Button onClick={() => void load()} disabled={loading} className="bg-blue-600 text-white hover:bg-blue-500"><RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button></div></div></header>
        <div className="mx-auto max-w-6xl px-5 py-8">
            {error && <div role="alert" className="mb-6 rounded-lg border border-red-400/50 bg-red-950/40 p-4 text-red-100">{error} <Link href="/dashboard" className="ml-2 underline">Open the map</Link></div>}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat icon={Map} label="Active reports" value={summary.active} /><Stat icon={ShieldAlert} label="Emergency flags" value={summary.emergency} tone="red" /><Stat icon={AlertTriangle} label="High severity" value={summary.highSeverity} tone="amber" /><Stat icon={CheckCircle2} label="Admin approved" value={summary.adminApproved} tone="green" /></section>
            <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"><article className="rounded-xl border border-blue-900 bg-slate-900/70 p-5"><h2 className="text-lg font-bold">Reports by type</h2><p className="mt-1 text-sm text-slate-400">Based only on active, published reports.</p><div className="mt-6 space-y-4">{(data?.byType ?? []).map((item) => <div key={item._id}><div className="mb-1 flex justify-between text-sm"><span>{hazardTypeLabel(item._id)}</span><span className="font-semibold text-blue-300">{item.count}</span></div><div className="h-2 overflow-hidden rounded-full bg-blue-950"><div className="h-full rounded-full bg-blue-500" style={{ width: `${(item.count / largestType) * 100}%` }} /></div></div>)}{!loading && !data?.byType?.length && <p className="text-sm text-slate-400">No published active reports yet.</p>}</div><div className="mt-6 flex items-center gap-2 border-t border-blue-900 pt-4 text-sm text-slate-300"><ThumbsUp className="h-4 w-4 text-blue-400" /> {summary.communityVotes} community confirmations across active reports</div></article>
                <article className="rounded-xl border border-blue-900 bg-slate-900/70"><div className="border-b border-blue-900 p-5"><h2 className="text-lg font-bold">Recent public reports</h2><p className="mt-1 text-sm text-slate-400">No social-media claims or invented engagement data.</p></div><div className="divide-y divide-blue-950">{(data?.recent ?? []).map((hazard) => <div key={hazard.id} className="p-4"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold">{hazard.title || hazardTypeLabel(hazard.type)}</p><p className="mt-1 text-sm text-slate-400">{hazard.locationDescription || "Approximate map location"} · {formatTimeAgo(hazard.createdAt)}</p></div><div className="flex flex-wrap justify-end gap-2"><span className="rounded-full bg-blue-950 px-2 py-1 text-xs font-bold text-blue-200">{hazardTypeLabel(hazard.type)}</span>{hazard.emergency && <span className="rounded-full bg-red-950 px-2 py-1 text-xs font-bold text-red-200">Emergency</span>}{hazard.verificationStatus === "admin-approved" && <span className="rounded-full bg-emerald-950 px-2 py-1 text-xs font-bold text-emerald-200">Admin approved</span>}{hazard.isDemo && <span className="rounded-full bg-slate-800 px-2 py-1 text-xs font-bold text-slate-300">Sample</span>}</div></div></div>)}{!loading && !data?.recent?.length && <p className="p-5 text-sm text-slate-400">No published active reports yet.</p>}</div></article></section>
        </div>
    </main>;
}

function Stat({ icon: Icon, label, value, tone = "blue" }) { const colors = { blue: "text-blue-300", red: "text-red-300", amber: "text-amber-300", green: "text-emerald-300" }; return <article className="rounded-xl border border-blue-900 bg-slate-900/70 p-5"><Icon className={`h-5 w-5 ${colors[tone]}`} /><p className="mt-5 text-3xl font-black">{value}</p><p className="mt-1 text-sm text-slate-400">{label}</p></article>; }
