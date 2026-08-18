import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";

const sections = [
    ["1", "Use the hazard map", [["1.1 Browse active reports", "Open the hazard map to view active, published community reports. Filter by hazard type and use report details to understand its current verification status."], ["1.2 Confirm a report", "If you can safely verify that a report is still active, use Confirm. If it is incorrect, resolved, or misleading, use Dispute so it can be reviewed."]]],
    ["2", "Submit a report", [["2.1 Select the hazard type", "Choose the category that best describes the observed public hazard, then add the location, a factual description, and optional evidence."], ["2.2 Protect privacy", "Do not include personal details or sensitive images. Public map coordinates are deliberately approximate to reduce privacy and safety risks."]]],
    ["3", "Publication and verification", [["3.1 Community review", "Reports can gain confirmations from other signed-in users. This helps surface observations that may need attention."], ["3.2 Admin approval", "Administrators review reports, flags, and evidence. They can approve, resolve, hide, or remove content that is inaccurate, unsafe, or violates privacy rules."]]],
    ["4", "Account roles", [["4.1 Citizen", "Citizens can submit and confirm reports. Every public sign-up receives this role automatically."], ["4.2 Administrator", "Administrators are assigned through the protected role-management workflow. They can moderate reports, manage visibility, and oversee safety-related platform settings."]]],
];

export default function WorkflowGuidelinesPage() {
    return (
        <div className="min-h-screen bg-background text-slate-950">
            <AppHeader subtitle="Application workflow" />
            <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
                    <Link href="/" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"><Home className="h-4 w-4" aria-hidden="true" /> Home</Link><ChevronRight className="h-4 w-4" /><Link href="/guidelines" className="font-semibold text-primary hover:underline">Guidelines</Link><ChevronRight className="h-4 w-4" /><span className="text-slate-800">Application walkthrough &amp; workflow</span>
                </nav>
                <header className="mt-8 border-b border-border pb-8"><p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">Guidelines</p><h1 className="mt-2 text-[2rem] font-bold leading-10 tracking-[-0.03em] text-slate-950 sm:text-4xl sm:leading-[2.75rem]">Application walkthrough &amp; workflow</h1><p className="mt-3 max-w-3xl leading-7 text-slate-600">A concise guide to using Jagruk Bharat, from viewing the map to responsible moderation.</p></header>
                <article className="mt-8 max-w-4xl">
                    {sections.map(([number, title, items]) => <section key={number} className="border-b border-border py-8 first:pt-0 last:border-b-0"><h2 className="flex items-center gap-3 text-xl font-bold text-slate-950"><span className="inline-flex h-8 min-w-8 items-center justify-center rounded-[var(--radius-control)] bg-primary px-2 font-mono text-sm text-primary-foreground">{number}</span>{title}</h2><div className="mt-5">{items.map(([heading, text]) => <div key={heading} className="border-b border-border py-5 first:pt-0 last:border-b-0 last:pb-0"><h3 className="font-semibold text-slate-950">{heading}</h3><p className="mt-2 max-w-3xl leading-7 text-slate-600">{text}</p></div>)}</div></section>)}
                </article>
            </main>
            <SiteFooter />
        </div>
    );
}
