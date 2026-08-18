"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Download, Map, RefreshCw, ShieldAlert, ThumbsUp } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { formatTimeAgo, hazardTypeLabel } from "@/lib/hazard-utils";

const blank = { active: 0, emergency: 0, highSeverity: 0, adminApproved: 0, communityVotes: 0 };
const barColors = ["bg-[#1264b9]", "bg-[#38bdf8]", "bg-[#7dd3fc]", "bg-[#093f78]", "bg-[#94a3b8]"];

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
        <div className="analytics-page min-h-screen bg-background text-slate-950">
            <AppHeader subtitle="Hazard analytics" />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                <section className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">Public safety intelligence</p>
                        <h1 className="mt-2 text-[2rem] font-bold leading-10 tracking-[-0.03em] text-slate-950 sm:text-4xl sm:leading-[2.75rem]">Hazard analytics</h1>
                        <p className="mt-3 max-w-2xl text-base leading-6 text-slate-600">A transparent view of active, published community reports and their verification status.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" asChild>
                            <a href="/api/analytics/export"><Download className="h-4 w-4" aria-hidden="true" />Export CSV</a>
                        </Button>
                        <Button onClick={() => void load()} disabled={loading}>
                            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />Refresh
                        </Button>
                    </div>
                </section>

                {error ? <div role="alert" className="mt-6 rounded-[var(--radius-card)] border border-[#fca5a5] bg-[#fef2f2] p-4 text-sm font-semibold text-destructive">{error} <Link href="/dashboard" className="ml-1 underline">Open the hazard map</Link></div> : null}

                <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard icon={Map} label="Active reports" value={summary.active} />
                    <StatCard icon={ShieldAlert} label="Emergency flags" value={summary.emergency} tone="danger" />
                    <StatCard icon={AlertTriangle} label="High severity" value={summary.highSeverity} tone="warning" />
                    <StatCard icon={CheckCircle2} label="Admin approved" value={summary.adminApproved} tone="success" />
                </section>

                <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                    <Card className="gap-0 py-0">
                        <CardHeader className="border-b border-border p-6">
                            <h2 className="text-lg font-bold text-slate-950">Reports by type</h2>
                            <p className="mt-1 text-sm text-slate-600">Based only on active, published reports.</p>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-5">
                                {(data?.byType ?? []).map((item, index) => (
                                    <div key={item._id}>
                                        <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                                            <span className="font-semibold text-slate-700">{hazardTypeLabel(item._id)}</span>
                                            <span className="font-mono font-semibold text-primary">{item.count}</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-[2px] bg-slate-200">
                                            <div className={`h-full transition-all duration-300 ease-out ${barColors[index % barColors.length]}`} style={{ width: `${(item.count / largestType) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                                {!loading && !data?.byType?.length ? <EmptyState icon={Map} message="No published active reports yet." /> : null}
                            </div>
                            <div className="mt-7 flex items-center gap-2 border-t border-border pt-4 text-sm text-slate-600">
                                <ThumbsUp className="h-4 w-4 text-primary" aria-hidden="true" />
                                <span className="font-mono font-semibold text-slate-950">{summary.communityVotes}</span> community confirmations across active reports
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="gap-0 py-0">
                        <CardHeader className="border-b border-border p-6">
                            <h2 className="text-lg font-bold text-slate-950">Recent public reports</h2>
                            <p className="mt-1 text-sm text-slate-600">Reports submitted through Jagruk Bharat, not unverified social-media claims.</p>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ul className="px-6">
                                {(data?.recent ?? []).map((hazard) => (
                                    <li key={hazard.id} className="border-b border-border py-4 last:border-b-0">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-slate-950">{hazard.title || hazardTypeLabel(hazard.type)}</p>
                                                <p className="mt-1 text-sm leading-5 text-slate-600">{hazard.locationDescription || "Approximate map location"} · {formatTimeAgo(hazard.createdAt)}</p>
                                            </div>
                                            <div className="flex shrink-0 flex-wrap gap-2 sm:max-w-[48%] sm:justify-end">
                                                <Badge className="border-transparent bg-[#e1effb] text-[#093f78]">{hazardTypeLabel(hazard.type)}</Badge>
                                                {hazard.emergency ? <Badge className="border-transparent bg-[#fef2f2] text-destructive">Emergency</Badge> : null}
                                                {hazard.verificationStatus === "admin-approved" ? <Badge className="border-transparent bg-[#f0fdf4] text-[#15803d]">Admin approved</Badge> : null}
                                                {hazard.isDemo ? <Badge className="border-transparent bg-slate-100 text-slate-700">Sample</Badge> : null}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            {!loading && !data?.recent?.length ? <EmptyState icon={Map} message="No published active reports yet." className="m-6" /> : null}
                        </CardContent>
                    </Card>
                </section>
            </main>

            <SiteFooter />
        </div>
    );
}
