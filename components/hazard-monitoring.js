import Link from "next/link";
import { Activity, AlertTriangle, ArrowUpRight, Clock3, ShieldCheck } from "lucide-react";
import { HazardMap } from "@/components/HazardMap";

export function HazardMonitoring({ hazards, loading, error }) {
    const highRisk = hazards.filter((hazard) => hazard.severity === "high").length;
    const emergencies = hazards.filter((hazard) => hazard.emergency).length;

    return (
        <section className="border-y border-slate-800 bg-slate-900/45 py-8 backdrop-blur-sm lg:py-10">
            <div className="mx-auto max-w-[1600px] space-y-6 px-5 lg:px-8">
                <div className="overflow-hidden rounded-3xl border border-slate-700/90 bg-slate-900 p-4 shadow-2xl shadow-slate-950/40 sm:p-5">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-black text-white">India hazard monitoring grid</h2>
                                <LiveBadge />
                            </div>
                            <p className="mt-1 text-sm text-slate-400">Community reports from across India refresh automatically every few seconds.</p>
                        </div>
                        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-bold text-amber-300 transition-colors hover:text-amber-200">
                            Open monitoring dashboard <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </div>
                    {error && <p className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
                    {loading ? <MapLoading /> : <HazardMap hazards={hazards} className="h-[530px] w-full rounded-2xl z-0" />}
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                        <Clock3 className="h-3.5 w-3.5 text-cyan-400" />
                        Live community data. Report only when it is safe to do so.
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 overflow-hidden rounded-2xl border border-slate-700 bg-slate-700 shadow-lg shadow-slate-950/20 sm:gap-px">
                        <Stat label="Active reports" value={loading ? "—" : hazards.length} icon={Activity} tone="text-cyan-300" />
                        <Stat label="High risk" value={loading ? "—" : highRisk} icon={AlertTriangle} tone="text-amber-300" />
                        <Stat label="Emergency flags" value={loading ? "—" : emergencies} icon={ShieldCheck} tone="text-red-300" />
                    </div>
                </div>
            </div>
        </section>
    );
}

function LiveBadge() {
    return <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Live</div>;
}

function MapLoading() {
    return <div className="h-[530px] w-full animate-pulse rounded-2xl bg-slate-800" />;
}

function Stat({ label, value, icon: Icon, tone }) {
    return (
        <div className="bg-slate-900/90 p-4 sm:p-5">
            <Icon className={`mb-3 h-4 w-4 ${tone}`} />
            <p className="text-2xl font-black text-white sm:text-3xl">{value}</p>
            <p className="mt-1 text-xs font-semibold text-slate-400">{label}</p>
        </div>
    );
}
