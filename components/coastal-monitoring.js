import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from "next/link";
import { Activity, AlertTriangle, ArrowUpRight, Clock3, ShieldCheck } from "lucide-react";
import { HazardMap } from "@/components/HazardMap";
export function CoastalMonitoring({ hazards, loading, error }) {
    const highRisk = hazards.filter((hazard) => hazard.severity === "high").length;
    const emergencies = hazards.filter((hazard) => hazard.emergency).length;
    return (_jsx("section", { className: "border-y border-slate-800 bg-slate-900/45 py-8 backdrop-blur-sm lg:py-10", children: _jsx("div", { className: "mx-auto max-w-[1600px] space-y-6 px-5 lg:px-8", children: _jsxs("div", { className: "overflow-hidden rounded-3xl border border-slate-700/90 bg-slate-900 p-4 shadow-2xl shadow-slate-950/40 sm:p-5", children: [_jsxs("div", { className: "mb-4 flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h2", { className: "text-2xl font-black text-white", children: "Coastal monitoring grid" }), _jsx(LiveBadge, {})] }), _jsx("p", { className: "mt-1 text-sm text-slate-400", children: "Community reports refresh automatically every few seconds." })] }), _jsxs(Link, { href: "/dashboard", className: "inline-flex items-center gap-1 text-sm font-bold text-amber-300 transition-colors hover:text-amber-200", children: ["Open command center ", _jsx(ArrowUpRight, { className: "h-4 w-4" })] })] }), error && _jsx("p", { className: "mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300", children: error }), loading ? _jsx(MapLoading, {}) : _jsx(HazardMap, { hazards: hazards, className: "h-[530px] w-full rounded-2xl z-0" }), _jsxs("div", { className: "mt-3 flex items-center gap-2 text-xs text-slate-400", children: [_jsx(Clock3, { className: "h-3.5 w-3.5 text-cyan-400" }), "Last sync is live. Report only when it is safe to do so."] }), _jsxs("div", { className: "mt-4 grid grid-cols-3 gap-2 overflow-hidden rounded-2xl border border-slate-700 bg-slate-700 shadow-lg shadow-slate-950/20 sm:gap-px", children: [_jsx(Stat, { label: "Active reports", value: loading ? "—" : hazards.length, icon: Activity, tone: "text-cyan-300" }), _jsx(Stat, { label: "High risk", value: loading ? "—" : highRisk, icon: AlertTriangle, tone: "text-amber-300" }), _jsx(Stat, { label: "Emergency", value: loading ? "—" : emergencies, icon: ShieldCheck, tone: "text-red-300" })] })] }) }) }));
}
function LiveBadge() {
    return _jsxs("div", { className: "flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300", children: [_jsx("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" }), " Live"] });
}
function MapLoading() {
    return _jsx("div", { className: "h-[530px] w-full animate-pulse rounded-2xl bg-slate-800" });
}
function Stat({ label, value, icon: Icon, tone }) {
    return _jsxs("div", { className: "bg-slate-900/90 p-4 sm:p-5", children: [_jsx(Icon, { className: `mb-3 h-4 w-4 ${tone}` }), _jsx("p", { className: "text-2xl font-black text-white sm:text-3xl", children: value }), _jsx("p", { className: "mt-1 text-xs font-semibold text-slate-400", children: label })] });
}
