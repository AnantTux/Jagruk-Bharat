import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { SITE } from "@/lib/site";

export function SiteBrand({ href = "/", subtitle, light = false }) {
    return (
        <Link href={href} aria-label="Jagruk Bharat home" className="flex cursor-pointer items-center gap-3 focus-visible:rounded-[var(--radius-control)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/35">
            <div className={`flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] ${light ? "border border-white/40 bg-white/10" : "bg-primary"}`}>
                <ShieldCheck className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <div className="min-w-0">
                <p className={`font-display text-xl font-bold leading-6 tracking-[-0.02em] ${light ? "text-white" : "text-slate-900"}`}>{SITE.name}</p>
                <p className={`truncate text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] ${light ? "text-[#dbeafe]" : "text-primary"}`}>
                    {subtitle ?? SITE.tagline}
                </p>
            </div>
        </Link>
    );
}
