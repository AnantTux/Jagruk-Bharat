import Link from "next/link";
import { Camera, MapPin, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";

export function HomeHero() {
    return (
        <section className="mx-auto max-w-[1600px] px-5 pb-10 pt-12 lg:px-8 lg:pt-16">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                Community safety intelligence across India
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl">
                See danger sooner.<br />
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                    Help make India safer.
                </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
                {SITE.description} Share responsible observations, monitor active alerts, and help people nearby make safer decisions.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" className="h-12 bg-amber-400 px-6 font-bold text-slate-950 hover:bg-amber-300" asChild>
                    <Link href="/report"><Camera className="mr-2" /> Report Hazard</Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 border-slate-600 bg-slate-900/50 px-6 text-white hover:bg-slate-800" asChild>
                    <Link href="/dashboard"><MapPin className="mr-2" /> Explore live map</Link>
                </Button>
            </div>
        </section>
    );
}
