import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Anchor, Phone, Shield, Waves, Wind } from "lucide-react";
import { INDIAN_EMERGENCY } from "@/lib/emergency";
const items = [
    {
        icon: Waves,
        iconClass: "text-amber-400",
        bgClass: "bg-amber-400/20",
        title: "Rip currents",
        body: "If caught in a rip, swim parallel to the shore until out of the current, then angle back to land. Do not swim against the flow.",
    },
    {
        icon: Wind,
        iconClass: "text-sky-400",
        bgClass: "bg-sky-400/20",
        title: "Cyclone & squall watch",
        body: "Monitor IMD coastal bulletins. Secure boats, avoid piers during high wind, and move inland when district authorities issue orange or red alerts.",
    },
    {
        icon: Anchor,
        iconClass: "text-blue-400",
        bgClass: "bg-blue-400/20",
        title: "Before entering the water",
        body: "Check local tide tables, lifeguard flags, and recent map reports. Never swim alone at dusk or on unpatrolled beaches.",
    },
    {
        icon: AlertTriangle,
        iconClass: "text-red-400",
        bgClass: "bg-red-400/20",
        title: "Reporting hazards",
        body: "Pin the exact location on the map, add photos when safe, and upvote or downvote alerts so responders can trust community signals.",
    },
    {
        icon: Shield,
        iconClass: "text-emerald-400",
        bgClass: "bg-emerald-400/20",
        title: "Tsunami awareness",
        body: "After strong coastal shaking, move to high ground immediately. Do not wait for an official warning if the sea withdraws unusually far.",
    },
    {
        icon: Phone,
        iconClass: "text-blue-400",
        bgClass: "bg-blue-400/20",
        title: "India emergency numbers",
        body: `${INDIAN_EMERGENCY.national.number} (national) · ${INDIAN_EMERGENCY.police.number} police · ${INDIAN_EMERGENCY.ambulance.number} ambulance · ${INDIAN_EMERGENCY.coastGuard.number} Coast Guard · ${INDIAN_EMERGENCY.fire.number} fire`,
    },
];
export function SafetyBriefing() {
    return (_jsxs("aside", { className: "rounded-3xl border border-slate-700/80 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/30 backdrop-blur sm:p-5", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between border-b border-slate-700/80 pb-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-bold uppercase tracking-[0.2em] text-amber-300", children: "Stay prepared" }), _jsx("h3", { className: "mt-1 text-xl font-black text-white", children: "Safety briefing" })] }), _jsx(Shield, { className: "h-5 w-5 text-emerald-400" })] }), _jsx("div", { className: "grid gap-2 sm:grid-cols-2 xl:grid-cols-3", children: items.map((item) => {
                    const Icon = item.icon;
                    return (_jsx(Card, { className: "border-slate-700/80 bg-slate-800/70 shadow-none transition-colors hover:border-slate-600 hover:bg-slate-800", children: _jsx(CardContent, { className: "p-3.5", children: _jsxs("div", { className: "flex gap-3", children: [_jsx("div", { className: `flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.bgClass}`, children: _jsx(Icon, { className: `h-4 w-4 ${item.iconClass}` }) }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-bold text-white", children: item.title }), _jsx("p", { className: "mt-1 text-xs leading-relaxed text-slate-400", children: item.body })] })] }) }) }, item.title));
                }) })] }));
}
