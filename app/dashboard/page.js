"use client";
/* eslint-disable @next/next/no-img-element -- evidence images can be local or external object-storage URLs */

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronRight, Layers, MapPin, RefreshCw, Search, ThumbsDown, ThumbsUp } from "lucide-react";
import { HazardMap } from "@/components/HazardMap";
import { useHazards } from "@/hooks/use-hazards";
import { DEFAULT_ZOOM, findHazard, formatTimeAgo, hazardTrustScore, hazardTypeLabel, INDIA_CENTER } from "@/lib/hazard-utils";
import { dashboardHazardTypes } from "@/lib/hazard-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/ui/empty-state";
import { AppHeader } from "@/components/app-header";

export default function MapDashboard() {
    const { hazards, loading, error, refresh, voteHazard } = useHazards();
    const [selectedId, setSelectedId] = useState(null);
    const [activeFilters, setActiveFilters] = useState([]);
    const [showMarkers, setShowMarkers] = useState(true);
    const [showHeatMap, setShowHeatMap] = useState(false);
    const [query, setQuery] = useState("");
    const [searchMessage, setSearchMessage] = useState("");
    const [mapCenter, setMapCenter] = useState(INDIA_CENTER);
    const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
    const [votingId, setVotingId] = useState(null);
    const [notice, setNotice] = useState("");

    const visibleHazards = useMemo(() => hazards.filter((hazard) => activeFilters.length === 0 || activeFilters.includes(hazard.type)), [hazards, activeFilters]);
    const selected = findHazard(hazards, selectedId);

    const toggleFilter = (type) => setActiveFilters((current) => current.includes(type) ? current.filter((value) => value !== type) : [...current, type]);

    const searchLocation = useCallback(async (event) => {
        event.preventDefault();
        if (!query.trim()) return;
        setSearchMessage("");
        try {
            const response = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error ?? "Location not found");
            setMapCenter([data.lat, data.lng]);
            setMapZoom(11);
            setSearchMessage(`Map centered on ${data.label}.`);
        }
        catch (error) {
            setSearchMessage(error instanceof Error ? error.message : "Location search failed.");
        }
    }, [query]);

    const vote = useCallback(async (hazardId, direction) => {
        setVotingId(hazardId);
        setNotice("");
        try {
            await voteHazard(hazardId, direction);
            setNotice("Your community signal was recorded.");
        }
        catch (voteError) {
            setNotice(voteError instanceof Error ? voteError.message : "Vote could not be recorded.");
        }
        finally { setVotingId(null); }
    }, [voteHazard]);

    return <div className="min-h-screen bg-background text-slate-950">
        <AppHeader subtitle="Live safety map" showDashboard={false} />

        <main className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[360px_minmax(0,1fr)]">
            <aside aria-label="Hazard map controls" className="z-20 border-b border-border bg-[#f7f9f9] lg:border-b-0 lg:border-r">
                <div className="max-h-[calc(100vh-72px)] space-y-6 overflow-y-auto p-5 lg:p-6">
                    <section aria-labelledby="location-heading">
                        <div className="mb-3 flex items-center gap-3">
                            <span className="font-mono text-sm font-semibold text-primary">01</span>
                            <h1 id="location-heading" className="text-lg font-bold text-slate-950">Find a location</h1>
                        </div>
                        <form onSubmit={searchLocation} className="space-y-3 rounded-[var(--radius-card)] border border-border bg-white p-4">
                            <label htmlFor="map-search" className="text-sm font-semibold text-slate-700">Address, city, or landmark</label>
                            <div className="flex gap-2">
                                <Input id="map-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. MG Road, Bengaluru" />
                                <Button type="submit" size="icon">
                                    <Search className="h-4 w-4" aria-hidden="true" />
                                    <span className="sr-only">Search map</span>
                                </Button>
                            </div>
                        </form>
                        {searchMessage ? <p role="status" className="mt-2 text-sm text-slate-600">{searchMessage}</p> : null}
                    </section>

                    <section aria-labelledby="display-heading" className="border-t border-border pt-5">
                        <h2 id="display-heading" className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-slate-600">Map display</h2>
                        <div className="space-y-4 rounded-[var(--radius-card)] border border-border bg-white p-4">
                            <label className="flex cursor-pointer items-center justify-between gap-4">
                                <span className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-primary" aria-hidden="true" />Report markers</span>
                                <Switch checked={showMarkers} onCheckedChange={setShowMarkers} aria-label="Show report markers" />
                            </label>
                            <label className="flex cursor-pointer items-center justify-between gap-4">
                                <span className="flex items-center gap-2 font-semibold"><Layers className="h-4 w-4 text-primary" aria-hidden="true" />Risk zones</span>
                                <Switch checked={showHeatMap} onCheckedChange={setShowHeatMap} aria-label="Show risk zones" />
                            </label>
                        </div>
                    </section>

                    <section aria-labelledby="filter-heading" className="border-t border-border pt-5">
                        <h2 id="filter-heading" className="mb-2 text-sm font-bold uppercase tracking-[0.12em] text-slate-600">Hazard types</h2>
                        <p className="mb-3 text-sm leading-5 text-slate-600">Select one or more categories to focus the map.</p>
                        <div className="grid grid-cols-2 gap-2">
                            {dashboardHazardTypes.map((hazard) => {
                                const active = activeFilters.includes(hazard.id);
                                return <button key={hazard.id} type="button" aria-pressed={active} onClick={() => toggleFilter(hazard.id)} className={`min-h-11 rounded-[var(--radius-control)] border px-3 py-2 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${active ? "border-primary bg-[#e1effb] text-[#093f78]" : "border-border bg-white hover:border-[#94a3b8] hover:bg-[#f7f9f9]"}`}><span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${hazard.color}`} />{hazard.name}</button>;
                            })}
                        </div>
                    </section>

                    <section aria-labelledby="alerts-heading" className="border-t border-border pt-5">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 id="alerts-heading" className="text-sm font-bold uppercase tracking-[0.12em] text-slate-600">Recent signals</h2>
                            <Button variant="ghost" size="icon" onClick={() => refresh()} aria-label="Refresh hazards" className="text-primary hover:bg-[#e1effb]">
                                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                            </Button>
                        </div>
                        <p className="mb-3 text-sm leading-5 text-slate-600">Community signals are not emergency-service alerts. Review evidence before voting.</p>
                        {notice ? <p role="status" className="mb-3 rounded-[var(--radius-control)] border border-primary/30 bg-[#e1effb] p-3 text-sm text-[#093f78]">{notice}</p> : null}
                        <div className="space-y-2">
                            {visibleHazards.slice(0, 6).map((hazard) => <article key={hazard.id} className={`rounded-[var(--radius-card)] border bg-white p-3 ${selectedId === hazard.id ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
                                <button type="button" onClick={() => setSelectedId(hazard.id)} className="w-full rounded-[var(--radius-control)] text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25">
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="font-semibold capitalize">{hazardTypeLabel(hazard.type)}</p>
                                        <span className={`rounded-[var(--radius-control)] px-2 py-0.5 text-xs font-bold ${hazard.severity === "high" ? "bg-[#fef2f2] text-destructive" : hazard.severity === "medium" ? "bg-[#fffbeb] text-[#92400e]" : "bg-[#e1effb] text-[#093f78]"}`}>{hazard.severity}</span>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-600">{formatTimeAgo(hazard.createdAt)} · trust {hazardTrustScore(hazard)}</p>
                                </button>
                                <div className="mt-3 flex gap-2 border-t border-border pt-2">
                                    <Button type="button" variant="outline" size="sm" disabled={votingId === hazard.id} onClick={() => void vote(hazard.id, "up")} className="flex-1"><ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />{hazard.upvotes}</Button>
                                    <Button type="button" variant="outline" size="sm" disabled={votingId === hazard.id} onClick={() => void vote(hazard.id, "down")} className="flex-1"><ThumbsDown className="h-3.5 w-3.5" aria-hidden="true" />{hazard.downvotes}</Button>
                                </div>
                            </article>)}
                            {!loading && visibleHazards.length === 0 ? <EmptyState icon={MapPin} message="No active reports match these filters." className="min-h-0 bg-white p-4" /> : null}
                        </div>
                    </section>
                </div>
            </aside>

            <section aria-label="Interactive safety map" className="relative min-h-[620px] bg-slate-200 lg:min-h-0">
                {loading ? <div className="grid h-full min-h-[620px] place-items-center text-slate-600">Loading the public safety map…</div> : <HazardMap hazards={showMarkers ? visibleHazards : []} center={mapCenter} zoom={mapZoom} showHeatMap={showHeatMap} selectedId={selectedId} onMarkerClick={setSelectedId} className="h-full min-h-[620px] w-full" />}
                {error ? <p role="alert" className="absolute left-4 top-4 z-30 max-w-sm rounded-[var(--radius-card)] border border-[#fca5a5] bg-[#fef2f2] p-3 text-sm font-semibold text-destructive shadow-[0_2px_8px_rgba(15,23,42,0.12)]">{error}</p> : null}
                <div className="pointer-events-none absolute left-4 top-4 z-20 hidden rounded-[var(--radius-card)] border border-border bg-white/95 p-3 shadow-[0_2px_8px_rgba(15,23,42,0.12)] sm:block">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Live public reports</p>
                    <p className="mt-1 font-mono text-2xl font-semibold text-primary">{visibleHazards.length}</p>
                </div>
                <div className="pointer-events-none absolute bottom-4 left-4 z-20 hidden w-64 rounded-[var(--radius-card)] border border-border bg-white/95 p-4 text-sm shadow-[0_2px_8px_rgba(15,23,42,0.12)] md:block">
                    <p className="mb-2 font-bold text-slate-950">Map guide</p>
                    <p className="flex items-start gap-2 text-slate-600"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#d97706]" aria-hidden="true" />Markers show approximate report locations to protect privacy.</p>
                </div>
                {selected ? <aside aria-label="Selected hazard details" className="absolute bottom-4 right-4 z-30 w-[min(360px,calc(100%-2rem))] rounded-[var(--radius-card)] border border-border bg-white shadow-[0_2px_8px_rgba(15,23,42,0.12)]">
                    <div className="flex items-start justify-between border-b border-border p-4">
                        <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Selected report</p><h2 className="mt-1 text-lg font-bold capitalize">{hazardTypeLabel(selected.type)}</h2></div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => setSelectedId(null)} aria-label="Close report details" className="text-slate-600 hover:bg-[#f7f9f9]">×</Button>
                    </div>
                    <div className="space-y-3 p-4">
                        <p className="text-sm text-slate-600"><MapPin className="mr-1 inline h-4 w-4" aria-hidden="true" />Approx. {selected.lat.toFixed(3)}, {selected.lng.toFixed(3)} · {formatTimeAgo(selected.createdAt)}</p>
                        {selected.description ? <p className="text-sm leading-6 text-slate-700">{selected.description}</p> : null}
                        {selected.photoUrls?.length > 0 ? <div className="grid grid-cols-3 gap-2">{selected.photoUrls.map((url) => <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="block aspect-square overflow-hidden rounded-[var(--radius-control)] border border-border focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"><img src={url} alt="Hazard evidence" className="h-full w-full object-cover" /></a>)}</div> : null}
                        <div className="flex gap-2">
                            <Button type="button" size="sm" onClick={() => void vote(selected.id, "up")} disabled={votingId === selected.id} className="flex-1"><ThumbsUp className="h-4 w-4" aria-hidden="true" />Confirm {selected.upvotes}</Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => void vote(selected.id, "down")} disabled={votingId === selected.id} className="flex-1"><ThumbsDown className="h-4 w-4" aria-hidden="true" />Dispute</Button>
                        </div>
                        <Link href="/report" className="flex items-center justify-between border-t border-border pt-3 text-sm font-semibold text-primary hover:underline">Report another hazard <ChevronRight className="h-4 w-4" aria-hidden="true" /></Link>
                    </div>
                </aside> : null}
            </section>
        </main>
    </div>;
}
