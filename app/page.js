"use client";

import { AlertTriangle, Phone } from "lucide-react";
import { AuthNav } from "@/components/auth-nav";
import { HazardMonitoring } from "@/components/hazard-monitoring";
import { HomeHero } from "@/components/home-hero";
import { SiteBrand } from "@/components/site-brand";
import { SiteFooter } from "@/components/site-footer";
import { useHazards } from "@/hooks/use-hazards";
import { EMERGENCY_BANNER } from "@/lib/emergency";
import { formatLatestAlert } from "@/lib/hazard-utils";

export default function Page() {
    const { hazards, loading, error } = useHazards();
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <SiteHeader />
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

function SiteHeader() {
    return (
        <header className="relative z-50 border-b border-blue-100 bg-white text-slate-900">
            <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-3 lg:px-8">
                <SiteBrand />
                <div className="hidden items-center gap-4 md:flex">
                    <AuthNav />
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
                <span className="hidden text-xs italic opacity-80 lg:block">Jagruk Bharat reports do not dispatch emergency services</span>
            </div>
        </div>
    );
}

function LatestAlert({ hazards }) {
    return <div className="relative border-b border-blue-200 bg-blue-50 text-blue-950"><div className="mx-auto flex max-w-[1600px] items-center gap-2 px-5 py-2 text-sm font-bold lg:px-8"><AlertTriangle className="h-4 w-4 shrink-0" /><span className="line-clamp-2">{formatLatestAlert(hazards)}</span></div></div>;
}
