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
import { SiteBrand } from "@/components/site-brand";
import { AuthNav } from "@/components/auth-nav";

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

    return <main className="min-h-screen bg-[#edf1f2] text-slate-900">
        <header className="bg-[#1264b9] text-white">
            <div className="flex min-h-[88px] flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
                <SiteBrand light />
                <nav aria-label="Primary" className="flex items-center gap-2"><AuthNav light showDashboard={false} /></nav>
            </div>
            <div className="h-2 bg-[#78be4c]" />
        </header>

        <div className="grid min-h-[calc(100vh-96px)] lg:grid-cols-[360px_minmax(0,1fr)]">
            <aside aria-label="Hazard map controls" className="z-20 border-b border-slate-300 bg-[#f7f9f9] lg:border-b-0 lg:border-r lg:border-slate-300">
                <div className="max-h-[calc(100vh-96px)] space-y-6 overflow-y-auto p-5 lg:p-6">
                    <section aria-labelledby="location-heading"><div className="mb-3 flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1264b9] text-sm font-bold text-white">1</span><h1 id="location-heading" className="text-lg font-semibold">Find a location</h1></div><form onSubmit={searchLocation} className="space-y-3 rounded-sm border border-slate-300 bg-white p-4 shadow-sm"><label htmlFor="map-search" className="text-sm font-semibold text-slate-700">Address, city, or landmark</label><div className="flex gap-2"><Input id="map-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. MG Road, Bengaluru" className="border-slate-400 bg-white text-slate-950 placeholder:text-slate-500" /><Button type="submit" className="bg-[#1264b9] px-3 text-white hover:bg-[#0e539d]"><Search className="h-4 w-4" /><span className="sr-only">Search map</span></Button></div></form>{searchMessage && <p role="status" className="mt-2 text-sm text-slate-600">{searchMessage}</p>}</section>

                    <section aria-labelledby="display-heading" className="border-t border-slate-300 pt-5"><h2 id="display-heading" className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">Map display</h2><div className="space-y-3 rounded-sm border border-slate-300 bg-white p-4"><label className="flex cursor-pointer items-center justify-between gap-4"><span className="flex items-center gap-2 font-medium"><MapPin className="h-4 w-4 text-[#1264b9]" />Report markers</span><Switch checked={showMarkers} onCheckedChange={setShowMarkers} aria-label="Show report markers" /></label><label className="flex cursor-pointer items-center justify-between gap-4"><span className="flex items-center gap-2 font-medium"><Layers className="h-4 w-4 text-[#1264b9]" />Risk zones</span><Switch checked={showHeatMap} onCheckedChange={setShowHeatMap} aria-label="Show risk zones" /></label></div></section>

                    <section aria-labelledby="filter-heading" className="border-t border-slate-300 pt-5"><h2 id="filter-heading" className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-600">Hazard types</h2><p className="mb-3 text-sm text-slate-600">Select one or more categories to focus the map.</p><div className="grid grid-cols-2 gap-2">{dashboardHazardTypes.map((hazard) => { const active = activeFilters.includes(hazard.id); return <button key={hazard.id} type="button" aria-pressed={active} onClick={() => toggleFilter(hazard.id)} className={`min-h-11 rounded-sm border px-3 py-2 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1264b9]/35 ${active ? "border-[#1264b9] bg-[#e1effb] text-[#093f78]" : "border-slate-300 bg-white hover:border-slate-500"}`}><span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${hazard.color}`} />{hazard.name}</button>; })}</div></section>

                    <section aria-labelledby="alerts-heading" className="border-t border-slate-300 pt-5"><div className="mb-3 flex items-center justify-between"><h2 id="alerts-heading" className="text-sm font-bold uppercase tracking-wide text-slate-600">Recent signals</h2><Button variant="ghost" size="sm" onClick={() => refresh()} aria-label="Refresh hazards"><RefreshCw className="h-4 w-4" /></Button></div><p className="mb-3 text-sm text-slate-600">Community signals are not emergency-service alerts. Review evidence before voting.</p>{notice && <p role="status" className="mb-3 rounded-sm border border-blue-200 bg-blue-50 p-2 text-sm text-blue-950">{notice}</p>}<div className="space-y-2">{visibleHazards.slice(0, 6).map((hazard) => <article key={hazard.id} className={`border bg-white p-3 ${selectedId === hazard.id ? "border-[#1264b9] ring-2 ring-[#1264b9]/20" : "border-slate-300"}`}><button type="button" onClick={() => setSelectedId(hazard.id)} className="w-full text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1264b9]/35"><div className="flex items-start justify-between gap-3"><p className="font-semibold capitalize">{hazardTypeLabel(hazard.type)}</p><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${hazard.severity === "high" ? "bg-red-100 text-red-800" : hazard.severity === "medium" ? "bg-amber-100 text-amber-900" : "bg-sky-100 text-sky-900"}`}>{hazard.severity}</span></div><p className="mt-1 text-sm text-slate-600">{formatTimeAgo(hazard.createdAt)} · trust {hazardTrustScore(hazard)}</p></button><div className="mt-3 flex gap-2 border-t border-slate-200 pt-2"><Button type="button" variant="outline" size="sm" disabled={votingId === hazard.id} onClick={() => void vote(hazard.id, "up")} className="h-8 flex-1 border-slate-300 text-slate-800"><ThumbsUp className="mr-1 h-3.5 w-3.5" />{hazard.upvotes}</Button><Button type="button" variant="outline" size="sm" disabled={votingId === hazard.id} onClick={() => void vote(hazard.id, "down")} className="h-8 flex-1 border-slate-300 text-slate-800"><ThumbsDown className="mr-1 h-3.5 w-3.5" />{hazard.downvotes}</Button></div></article>)}{!loading && visibleHazards.length === 0 && <p className="border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">No active reports match these filters.</p>}</div></section>
                </div>
            </aside>

            <section aria-label="Interactive safety map" className="relative min-h-[620px] bg-slate-200 lg:min-h-0">
                {loading ? <div className="grid h-full min-h-[620px] place-items-center text-slate-600">Loading the public safety map…</div> : <HazardMap hazards={showMarkers ? visibleHazards : []} center={mapCenter} zoom={mapZoom} showHeatMap={showHeatMap} selectedId={selectedId} onMarkerClick={setSelectedId} className="h-full min-h-[620px] w-full" />}
                {error && <p role="alert" className="absolute left-4 top-4 z-30 max-w-sm border border-red-300 bg-white p-3 text-sm text-red-800 shadow">{error}</p>}
                <div className="pointer-events-none absolute left-4 top-4 z-20 hidden border border-slate-300 bg-white/95 p-3 shadow-sm sm:block"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Live public reports</p><p className="mt-1 text-2xl font-bold text-[#1264b9]">{visibleHazards.length}</p></div>
                <div className="pointer-events-none absolute bottom-4 right-4 z-20 hidden w-64 border border-slate-300 bg-white/95 p-4 text-sm shadow-sm md:block"><p className="mb-2 font-bold text-slate-800">Map guide</p><p className="flex items-start gap-2 text-slate-600"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />Markers show approximate report locations to protect privacy.</p></div>
                {selected && <aside aria-label="Selected hazard details" className="absolute bottom-4 right-4 z-30 w-[min(360px,calc(100%-2rem))] border border-slate-400 bg-white shadow-xl"><div className="flex items-start justify-between border-b border-slate-200 p-4"><div><p className="text-xs font-bold uppercase tracking-wide text-[#1264b9]">Selected report</p><h2 className="mt-1 text-lg font-bold capitalize">{hazardTypeLabel(selected.type)}</h2></div><Button type="button" variant="ghost" size="sm" onClick={() => setSelectedId(null)} aria-label="Close report details">×</Button></div><div className="space-y-3 p-4"><p className="text-sm text-slate-600"><MapPin className="mr-1 inline h-4 w-4" />Approx. {selected.lat.toFixed(3)}, {selected.lng.toFixed(3)} · {formatTimeAgo(selected.createdAt)}</p>{selected.description && <p className="text-sm leading-6 text-slate-700">{selected.description}</p>}{selected.photoUrls?.length > 0 && <div className="grid grid-cols-3 gap-2">{selected.photoUrls.map((url) => <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="block aspect-square overflow-hidden border border-slate-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1264b9]/35"><img src={url} alt="Hazard evidence" className="h-full w-full object-cover" /></a>)}</div>}<div className="flex gap-2"><Button type="button" size="sm" onClick={() => void vote(selected.id, "up")} disabled={votingId === selected.id} className="flex-1 bg-[#1264b9] text-white hover:bg-[#0e539d]"><ThumbsUp className="mr-1 h-4 w-4" />Confirm {selected.upvotes}</Button><Button type="button" size="sm" variant="outline" onClick={() => void vote(selected.id, "down")} disabled={votingId === selected.id} className="flex-1 border-slate-400"><ThumbsDown className="mr-1 h-4 w-4" />Dispute</Button></div><Link href="/report" className="flex items-center justify-between border-t border-slate-200 pt-3 text-sm font-semibold text-[#1264b9] hover:underline">Report another hazard <ChevronRight className="h-4 w-4" /></Link></div></aside>}
            </section>
        </div>
    </main>;
}
