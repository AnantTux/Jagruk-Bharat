import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { SITE } from "@/lib/site";

export function SiteBrand({ href = "/", subtitle }) {
    return (
        <Link href={href} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
                <p className="text-xl font-bold tracking-tight text-slate-900">{SITE.name}</p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-600">
                    {subtitle ?? SITE.tagline}
                </p>
            </div>
        </Link>
    );
}
