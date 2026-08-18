import Link from "next/link";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";

export function HomeHero() {
    return (
        <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">Community-powered public safety</p>
            <h1 className="mt-3 max-w-4xl text-[2rem] font-bold leading-10 tracking-[-0.03em] text-slate-950 sm:text-4xl sm:leading-[2.75rem]">
                See danger sooner.<br />
                <span className="text-[#38bdf8]">
                    Help make India safer.
                </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-6 text-slate-600">
                {SITE.description} Share responsible observations, monitor active alerts, and help people nearby make safer decisions.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild>
                    <Link href="/report"><Camera aria-hidden="true" />Report Hazard</Link>
                </Button>
            </div>
        </section>
    );
}
