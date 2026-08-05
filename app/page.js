"use client";

import Link from "next/link";
import { AlertTriangle, Phone } from "lucide-react";
import { HazardMonitoring } from "@/components/hazard-monitoring";
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
    return (
        <div className="min-h-screen overflow-hidden bg-slate-950 font-sans text-white">
            <BackgroundGlow />
            <SiteHeader />
            <EmergencyBanner />
            <LatestAlert hazards={hazards} />
            <main className="relative">
                <HomeHero />
                <HazardMonitoring hazards={hazards} loading={loading} error={error} />
                <section className="mx-auto max-w-[1600px] px-5 py-8 lg:px-8 lg:py-10"><SafetyBriefing /></section>
            </main>
            <SiteFooter />
        </div>
    );
}

function BackgroundGlow() {
    return <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(14,116,144,0.2),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(245,158,11,0.1),transparent_20%)]" />;
}

function SiteHeader() {
    return (
        <header className="relative border-b border-slate-800 bg-slate-950/90 text-white backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-3 lg:px-8">
                <SiteBrand />
                <div className="hidden items-center gap-4 md:flex">
                    <Button variant="ghost" className="text-slate-300 hover:text-white" asChild><Link href="/login">Sign In</Link></Button>
                    <Button className="bg-amber-400 font-bold text-slate-800 hover:bg-amber-500" asChild><Link href="/signup">Join {SITE.name}</Link></Button>
                </div>
            </div>
        </header>
    );
}

function EmergencyBanner() {
    return (
        <div className="relative overflow-hidden bg-red-600 text-white">
            <div className="mx-auto flex max-w-[1600px] flex-col gap-1 px-5 py-2 sm:flex-row sm:items-center sm:justify-between lg:px-8">
                <div className="flex items-center gap-4 text-sm font-bold"><Phone className="h-4 w-4 shrink-0 animate-pulse" /><span className="text-xs sm:text-sm">{EMERGENCY_BANNER}</span></div>
                <span className="hidden text-xs italic opacity-80 lg:block">AnantTatt reports do not dispatch emergency services</span>
            </div>
        </div>
    );
}

function LatestAlert({ hazards }) {
    return <div className="relative border-b border-amber-300/30 bg-amber-400 text-slate-950"><div className="mx-auto flex max-w-[1600px] items-center gap-2 px-5 py-2 text-sm font-bold lg:px-8"><AlertTriangle className="h-4 w-4 shrink-0" /><span className="line-clamp-2">{formatLatestAlert(hazards)}</span></div></div>;
}
