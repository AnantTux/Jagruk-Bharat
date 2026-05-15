"use client"

import { Button } from "@/components/ui/button"
import { HazardMap } from "@/components/HazardMap"
import { useHazards } from "@/hooks/use-hazards"
import Link from "next/link"
import { SiteBrand } from "@/components/site-brand"
import { SiteFooter } from "@/components/site-footer"
import { SafetyBriefing } from "@/components/safety-briefing"
import { SITE } from "@/lib/site"
import { EMERGENCY_BANNER } from "@/lib/emergency"
import { formatLatestAlert } from "@/lib/hazard-utils"
import { AlertTriangle, MapPin, Camera, Phone } from "lucide-react"

export default function Page() {
  const { hazards, loading, error } = useHazards()

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <header className="bg-slate-800 border-b border-slate-700 text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <SiteBrand />
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" className="text-slate-300 hover:text-white" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button className="bg-amber-400 text-slate-800 hover:bg-amber-500 font-bold" asChild>
                <Link href="/signup">Join {SITE.name}</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-red-600 text-white py-2 overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex items-center gap-4 text-sm font-bold">
            <Phone className="w-4 h-4 animate-pulse shrink-0" />
            <span className="text-xs sm:text-sm">{EMERGENCY_BANNER}</span>
          </div>
          <div className="hidden lg:block text-xs opacity-80 italic">
            Priority response active for all coastal districts
          </div>
        </div>
      </div>

      <div className="bg-amber-500 text-slate-900 py-2">
        <div className="container mx-auto px-4 flex items-center gap-2 text-sm font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="line-clamp-2">{formatLatestAlert(hazards)}</span>
        </div>
      </div>

      <section className="relative py-20 bg-slate-900 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              {SITE.name}
              <br />
              <span className="text-amber-400">{SITE.tagline}</span>
            </h1>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
              {SITE.description} Report hazards on the map, watch updates in real time, and help keep coastal
              communities informed.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-amber-400 text-slate-900 hover:bg-amber-500 h-14 px-8 text-lg font-bold" asChild>
                <Link href="/report">
                  <Camera className="mr-2" /> Report Hazard
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-700 text-white hover:bg-slate-800 h-14 px-8 text-lg"
                asChild
              >
                <Link href="/dashboard">
                  <MapPin className="mr-2" /> Live Safety Map
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2 bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Coastal Monitoring Grid</h2>
                  <p className="text-slate-400 text-sm">Interactive real-time hazard data</p>
                </div>
                <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold border border-green-500/20">
                  LIVE
                </div>
              </div>
              {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
              {loading ? (
                <div className="h-[450px] w-full animate-pulse rounded-xl bg-slate-700" />
              ) : (
                <HazardMap hazards={hazards} className="h-[450px] w-full rounded-xl z-0" />
              )}
              <p className="mt-4 text-xs text-slate-400">
                Map updates every few seconds as new community reports arrive. Open the dashboard for filters and
                details.
              </p>
            </div>

            <SafetyBriefing />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}


