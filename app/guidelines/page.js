import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";

const sections = [
    {
        number: "1",
        title: "Introduction",
        items: [
            ["1.1 Purpose of Jagruk Bharat", "Jagruk Bharat helps communities share public hazard observations, review published reports, and make safer decisions. It does not replace emergency services."],
            ["1.2 Report responsibly", "Only report what you can observe safely. Do not enter restricted areas, obstruct responders, or put yourself at risk to collect evidence."],
        ],
    },
    {
        number: "2",
        title: "Safety protocols",
        items: [
            ["2.1 Road incidents", "Keep a safe distance, use hazard lights where appropriate, and call 112 for urgent assistance. Never move injured people unless there is an immediate danger."],
            ["2.2 Fire and smoke", "Move away from smoke and flames, alert people nearby, avoid lifts, and call 101 or 112 from a safe location."],
            ["2.3 Floods and severe weather", "Avoid flooded roads, low-lying areas, fallen wires, and fast-moving water. Follow official IMD and district advisories."],
        ],
    },
    {
        number: "3",
        title: "Submitting a hazard report",
        items: [
            ["3.1 Location and description", "Place the marker as accurately as is safe. Use a clear, factual description and avoid sharing anyone’s name, phone number, home address, or other personal information."],
            ["3.2 Photos and privacy", "Upload evidence only when it is safe. Avoid faces, vehicle number plates, children, medical information, and sensitive sites. The platform rounds public locations to protect privacy."],
            ["3.3 Verification", "Community confirmations and moderator review help determine whether a report should remain visible. Treat every report as situational information, not an instruction from emergency services."],
        ],
    },
    {
        number: "4",
        title: "Emergency contact information",
        items: [
            ["4.1 National services", "Call 112 for emergencies, 100 for police, 108 for ambulance services, 101 for fire services, and 1070 for disaster support where available."],
        ],
    },
];

export default function GuidelinesPage() {
    return (
        <div className="min-h-screen bg-background text-slate-950">
            <AppHeader subtitle="Safety guidelines" />
            <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
                    <Link href="/" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"><Home className="h-4 w-4" aria-hidden="true" /> Home</Link>
                    <ChevronRight className="h-4 w-4" />
                    <span>Guidelines</span><ChevronRight className="h-4 w-4" />
                    <span className="text-slate-800">Hazard safety guidelines</span>
                </nav>

                <header className="mt-8 border-b border-border pb-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">Guidelines</p>
                    <h1 className="mt-2 text-[2rem] font-bold leading-10 tracking-[-0.03em] text-slate-950 sm:text-4xl sm:leading-[2.75rem]">Hazard safety guidelines</h1>
                    <p className="mt-3 max-w-3xl text-base leading-6 text-slate-600">Practical, public-facing advice for safely identifying, reporting, and responding to hazards. Review official local instructions during an active emergency.</p>
                </header>

                <div className="mt-8 grid gap-10 lg:grid-cols-[13rem_minmax(0,1fr)]">
                    <aside className="h-fit border-l-2 border-primary/25 pl-4 text-sm lg:sticky lg:top-24">
                        <p className="font-bold text-slate-900">On this page</p>
                        <ol className="mt-3 space-y-2 text-slate-600">
                            {sections.map((section) => <li key={section.number}><a className="hover:text-primary hover:underline" href={`#section-${section.number}`}>{section.number}. {section.title}</a></li>)}
                        </ol>
                        <Link href="/guidelines/workflow" className="mt-6 block font-semibold text-primary hover:underline">View application walkthrough →</Link>
                    </aside>

                    <article>
                        {sections.map((section) => (
                            <section key={section.number} id={`section-${section.number}`} className="scroll-mt-24 border-b border-border py-8 first:pt-0 last:border-b-0">
                                <h2 className="flex items-center gap-3 text-xl font-bold text-slate-950"><span className="inline-flex h-8 min-w-8 items-center justify-center rounded-[var(--radius-control)] bg-primary px-2 font-mono text-sm text-primary-foreground">{section.number}</span>{section.title}</h2>
                                <div className="mt-5">
                                    {section.items.map(([heading, text]) => <div key={heading} className="border-b border-border py-5 first:pt-0 last:border-b-0 last:pb-0"><h3 className="font-semibold text-slate-950">{heading}</h3><p className="mt-2 max-w-3xl leading-7 text-slate-600">{text}</p></div>)}
                                </div>
                            </section>
                        ))}
                    </article>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}
