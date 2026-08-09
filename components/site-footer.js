import { ShieldCheck } from "lucide-react";
import { SITE } from "@/lib/site";

export function SiteFooter({ compact = false }) {
    return (
        <footer className="border-t border-blue-950/70 bg-slate-950 text-slate-400">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-xl space-y-3">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-blue-400" />
                        <span className="text-lg font-bold text-white">{SITE.name}</span>
                        <span className="text-sm text-blue-300">· {SITE.tagline}</span>
                    </div>
                    {!compact && <p className="text-sm leading-relaxed text-slate-400">{SITE.about}</p>}
                    <p className="text-xs text-slate-500">© {new Date().getFullYear()} {SITE.name}. Built by Anant.</p>
                </div>
            </div>
        </footer>
    );
}
