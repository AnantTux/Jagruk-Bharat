import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SafetyBriefing } from "@/components/safety-briefing";

export default function GuidelinesPage() {
    return <main className="min-h-screen bg-slate-950 px-5 py-10 text-white lg:px-8">
        <div className="mx-auto max-w-[1600px]">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-200"><ArrowLeft className="h-4 w-4" /> Hazard map</Link>
            <div className="mb-8 mt-6"><p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-300">Guidelines</p><h1 className="mt-2 text-4xl font-black">Stay prepared</h1><p className="mt-3 max-w-2xl text-slate-300">Use these practical safety guidelines before, during, and after reporting a public hazard.</p></div>
            <SafetyBriefing />
        </div>
    </main>;
}
