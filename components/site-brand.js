import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { SITE } from "@/lib/site";

export function SiteBrand({ href = "/", subtitle }) {
    return (
        <Link href={href} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400 shadow-lg">
                <ShieldCheck className="h-6 w-6 text-slate-900" />
            </div>
            <div>
                <p className="text-xl font-bold tracking-tight text-white">{SITE.name}</p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">
                    {subtitle ?? SITE.tagline}
                </p>
            </div>
        </Link>
    );
}
