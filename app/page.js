"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from "next/link";
import { AlertTriangle, Phone } from "lucide-react";
import { CoastalMonitoring } from "@/components/coastal-monitoring";
import { HomeHero } from "@/components/home-hero";
import { SafetyBriefing } from "@/components/safety-briefing";
import { SiteBrand } from "@/components/site-brand";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { useHazards } from "@/hooks/use-hazards";
import { EMERGENCY_BANNER } from "@/lib/emergency";
import { formatLatestAlert } from "@/lib/hazard-utils";
import { SITE } from "@/lib/site";
export default function Page() {
    const { hazards, loading, error } = useHazards();
    return (_jsxs("div", { className: "min-h-screen overflow-hidden bg-slate-950 font-sans text-white", children: [_jsx(BackgroundGlow, {}), _jsx(SiteHeader, {}), _jsx(EmergencyBanner, {}), _jsx(LatestAlert, { hazards: hazards }), _jsxs("main", { className: "relative", children: [_jsx(HomeHero, {}), _jsx(CoastalMonitoring, { hazards: hazards, loading: loading, error: error }), _jsx("section", { className: "mx-auto max-w-[1600px] px-5 py-8 lg:px-8 lg:py-10", children: _jsx(SafetyBriefing, {}) })] }), _jsx(SiteFooter, {})] }));
}
function BackgroundGlow() {
    return _jsx("div", { className: "pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(14,116,144,0.2),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(245,158,11,0.1),transparent_20%)]" });
}
function SiteHeader() {
    return (_jsx("header", { className: "relative border-b border-slate-800 bg-slate-950/90 text-white backdrop-blur-xl", children: _jsxs("div", { className: "mx-auto flex max-w-[1600px] items-center justify-between px-5 py-3 lg:px-8", children: [_jsx(SiteBrand, {}), _jsxs("div", { className: "hidden items-center gap-4 md:flex", children: [_jsx(Button, { variant: "ghost", className: "text-slate-300 hover:text-white", asChild: true, children: _jsx(Link, { href: "/login", children: "Sign In" }) }), _jsx(Button, { className: "bg-amber-400 font-bold text-slate-800 hover:bg-amber-500", asChild: true, children: _jsxs(Link, { href: "/signup", children: ["Join ", SITE.name] }) })] })] }) }));
}
function EmergencyBanner() {
    return (_jsx("div", { className: "relative overflow-hidden bg-red-600 text-white", children: _jsxs("div", { className: "mx-auto flex max-w-[1600px] flex-col gap-1 px-5 py-2 sm:flex-row sm:items-center sm:justify-between lg:px-8", children: [_jsxs("div", { className: "flex items-center gap-4 text-sm font-bold", children: [_jsx(Phone, { className: "h-4 w-4 shrink-0 animate-pulse" }), _jsx("span", { className: "text-xs sm:text-sm", children: EMERGENCY_BANNER })] }), _jsx("span", { className: "hidden text-xs italic opacity-80 lg:block", children: "Priority response active for all coastal districts" })] }) }));
}
function LatestAlert({ hazards }) {
    return _jsx("div", { className: "relative border-b border-amber-300/30 bg-amber-400 text-slate-950", children: _jsxs("div", { className: "mx-auto flex max-w-[1600px] items-center gap-2 px-5 py-2 text-sm font-bold lg:px-8", children: [_jsx(AlertTriangle, { className: "h-4 w-4 shrink-0" }), _jsx("span", { className: "line-clamp-2", children: formatLatestAlert(hazards) })] }) });
}
