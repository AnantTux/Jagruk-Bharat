import { Activity, AlertTriangle, Clock3, ShieldCheck } from "lucide-react";
import { HazardMap } from "@/components/HazardMap";
import { StatCard } from "@/components/ui/stat-card";

export function HazardMonitoring({ hazards, loading, error }) {
    const highRisk = hazards.filter((hazard) => hazard.severity === "high").length;
    const emergencies = hazards.filter((hazard) => hazard.emergency).length;
    return <section className="border-y border-border bg-white py-8 lg:py-12"><div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8"><div className="mb-6 flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-3"><h2 className="text-2xl font-bold text-slate-950">India hazard monitoring grid</h2><LiveBadge /></div><p className="mt-2 text-sm text-slate-600">Published community reports update automatically.</p></div></div>{error ? <p role="alert" className="mb-4 rounded-[var(--radius-card)] border border-[#fca5a5] bg-[#fef2f2] px-4 py-3 text-sm font-semibold text-destructive">{error}</p> : null}{loading ? <MapLoading /> : <HazardMap hazards={hazards} className="h-[530px] w-full rounded-[var(--radius-card)] border border-border" />}<div className="mt-3 flex items-center gap-2 text-xs text-slate-600"><Clock3 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />Locations are approximate to protect privacy. Report only when it is safe.</div><div className="mt-6 grid gap-4 sm:grid-cols-3"><StatCard label="Active reports" value={loading ? "—" : hazards.length} icon={Activity} /><StatCard label="High risk" value={loading ? "—" : highRisk} icon={AlertTriangle} tone="warning" /><StatCard label="Emergency flags" value={loading ? "—" : emergencies} icon={ShieldCheck} tone="danger" /></div></div></section>;
}
function LiveBadge() { return <div className="flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[#f0fdf4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#15803d]"><span className="h-1.5 w-1.5 rounded-full bg-[#15803d]" />Live</div>; }
function MapLoading() { return <div className="h-[530px] w-full animate-pulse rounded-[var(--radius-card)] border border-border bg-[#f7f9f9]" />; }
