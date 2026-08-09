"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Download, Map, RefreshCw, ShieldAlert, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTimeAgo, hazardTypeLabel } from "@/lib/hazard-utils";

const blank = { active: 0, emergency: 0, highSeverity: 0, adminApproved: 0, communityVotes: 0 };
const barColors = ["bg-blue-600", "bg-sky-500", "bg-indigo-500", "bg-cyan-500", "bg-blue-400"];

export default function HazardAnalytics() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        setError("");
        try {
            const response = await fetch("/api/analytics", { cache: "no-store" });
            const body = await response.json();
            if (!response.ok) throw new Error(body.error);
            setData(body);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Unable to load analytics.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => { void load(); }, 0);
        return () => clearTimeout(timer);
    }, []);

    const summary = data?.summary ?? blank;
    const largestType = Math.max(1, ...(data?.byType?.map((item) => item.count) ?? [1]));

    return (
        <main className="analytics-page min-h-screen bg-slate-50 text-slate-900">
            <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
                <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Jagruk Bharat</p>
                            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Hazard analytics</h1>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">A transparent view of active, published community reports and their verification status.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" className="border-blue-200 text-blue-800 hover:bg-blue-50" asChild>
                                <a href="/api/analytics/export"><Download className="mr-2 h-4 w-4" /> Export CSV</a>
                            </Button>
                            <Button onClick={() => void load()} disabled={loading} className="bg-blue-700 text-white hover:bg-blue-800">
                                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
                            </Button>
                        </div>
                    </div>
                </section>

                {error && (
                    <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                        {error} <Link href="/dashboard" className="ml-1 font-semibold underline">Open the hazard map</Link>
                    </div>
                )}

                <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Stat icon={Map} label="Active reports" value={summary.active} />
                    <Stat icon={ShieldAlert} label="Emergency flags" value={summary.emergency} tone="red" />
                    <Stat icon={AlertTriangle} label="High severity" value={summary.highSeverity} tone="amber" />
                    <Stat icon={CheckCircle2} label="Admin approved" value={summary.adminApproved} tone="green" />
                </section>

                <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                    <article className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-950">Reports by type</h2>
                        <p className="mt-1 text-sm text-slate-600">Based only on active, published reports.</p>
                        <div className="mt-6 space-y-5">
                            {(data?.byType ?? []).map((item, index) => (
                                <div key={item._id}>
                                    <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                                        <span className="font-medium text-slate-700">{hazardTypeLabel(item._id)}</span>
                                        <span className="font-bold text-blue-800">{item.count}</span>
                                    </div>
                                    <div className="h-2.5 overflow-hidden rounded-full bg-blue-50">
                                        <div className={`h-full rounded-full transition-all duration-300 ease-out ${barColors[index % barColors.length]}`} style={{ width: `${(item.count / largestType) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                            {!loading && !data?.byType?.length && <p className="text-sm text-slate-500">No published active reports yet.</p>}
                        </div>
                        <div className="mt-7 flex items-center gap-2 border-t border-slate-200 pt-4 text-sm text-slate-600">
                            <ThumbsUp className="h-4 w-4 text-blue-700" /> {summary.communityVotes} community confirmations across active reports
                        </div>
                    </article>

                    <article className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
                        <div className="border-b border-slate-200 p-6">
                            <h2 className="text-lg font-bold text-slate-950">Recent public reports</h2>
                            <p className="mt-1 text-sm text-slate-600">Reports submitted through Jagruk Bharat, not unverified social-media claims.</p>
                        </div>
                        <ul className="px-6">
                            {(data?.recent ?? []).map((hazard) => (
                                <li key={hazard.id} className="border-b border-slate-200 py-4 last:border-b-0">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-slate-900">{hazard.title || hazardTypeLabel(hazard.type)}</p>
                                            <p className="mt-1 text-sm leading-5 text-slate-600">{hazard.locationDescription || "Approximate map location"} · {formatTimeAgo(hazard.createdAt)}</p>
                                        </div>
                                        <div className="flex shrink-0 flex-wrap gap-2 sm:max-w-[48%] sm:justify-end">
                                            <Badge className="bg-blue-50 text-blue-800">{hazardTypeLabel(hazard.type)}</Badge>
                                            {hazard.emergency && <Badge className="bg-red-50 text-red-800">Emergency</Badge>}
                                            {hazard.verificationStatus === "admin-approved" && <Badge className="bg-emerald-50 text-emerald-800">Admin approved</Badge>}
                                            {hazard.isDemo && <Badge className="bg-slate-100 text-slate-700">Sample</Badge>}
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {!loading && !data?.recent?.length && <li className="py-5 text-sm text-slate-500">No published active reports yet.</li>}
                        </ul>
                    </article>
                </section>
            </div>
        </main>
    );
}

function Badge({ children, className }) {
    return <span className={`rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap ${className}`}>{children}</span>;
}

function Stat({ icon: Icon, label, value, tone = "blue" }) {
    const colors = {
        blue: "bg-blue-50 text-blue-700",
        red: "bg-red-50 text-red-700",
        amber: "bg-orange-50 text-orange-700",
        green: "bg-emerald-50 text-emerald-700",
    };
    return (
        <article className="min-h-40 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${colors[tone]}`}><Icon className="h-5 w-5" /></span>
            <p className="mt-5 text-3xl font-black tracking-tight text-slate-950">{value}</p>
            <p className="mt-1 text-sm font-medium text-slate-600">{label}</p>
        </article>
    );
}
