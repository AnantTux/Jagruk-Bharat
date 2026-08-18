"use client";

import { AlertTriangle, Phone } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { HazardMonitoring } from "@/components/hazard-monitoring";
import { HomeHero } from "@/components/home-hero";
import { SiteFooter } from "@/components/site-footer";
import { useHazards } from "@/hooks/use-hazards";
import { EMERGENCY_BANNER } from "@/lib/emergency";
import { formatLatestAlert } from "@/lib/hazard-utils";

export default function Page() {
    const { hazards, loading, error } = useHazards();
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <AppHeader />
            <EmergencyBanner />
            <LatestAlert hazards={hazards} />
            <main className="relative">
                <HomeHero />
                <HazardMonitoring hazards={hazards} loading={loading} error={error} />
            </main>
            <SiteFooter />
        </div>
    );
}

function EmergencyBanner() {
    return (
        <div className="relative overflow-hidden bg-destructive text-white">
            <div className="mx-auto flex max-w-[1440px] flex-col gap-1 px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 text-sm font-bold"><Phone className="h-4 w-4 shrink-0 animate-pulse" aria-hidden="true" /><span className="text-xs sm:text-sm">{EMERGENCY_BANNER}</span></div>
                <span className="hidden text-xs italic opacity-80 lg:block">Jagruk Bharat reports do not dispatch emergency services</span>
            </div>
        </div>
    );
}

function LatestAlert({ hazards }) {
    return <div className="relative border-b border-primary/25 bg-[#e1effb] text-[#093f78]"><div className="mx-auto flex max-w-[1440px] items-center gap-2 px-4 py-2 text-sm font-semibold sm:px-6 lg:px-8"><AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="line-clamp-2">{formatLatestAlert(hazards)}</span></div></div>;
}
