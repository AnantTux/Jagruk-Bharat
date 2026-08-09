import Link from "next/link";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";

export function HomeHero() {
    return (
        <section className="mx-auto max-w-[1600px] px-5 pb-10 pt-12 lg:px-8 lg:pt-16">
            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-slate-950 md:text-7xl">
                See danger sooner.<br />
                <span className="bg-gradient-to-r from-blue-300 via-sky-400 to-cyan-300 bg-clip-text text-transparent">
                    Help make India safer.
                </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
                {SITE.description} Share responsible observations, monitor active alerts, and help people nearby make safer decisions.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" className="h-12 bg-blue-600 px-6 font-bold text-white hover:bg-blue-500" asChild>
                    <Link href="/report"><Camera className="mr-2" /> Report Hazard</Link>
                </Button>
            </div>
        </section>
    );
}
