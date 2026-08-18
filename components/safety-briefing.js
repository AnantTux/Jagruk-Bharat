import { AlertTriangle, Car, CloudRain, Flame, Phone, Shield } from "lucide-react";
import { INDIAN_EMERGENCY } from "@/lib/emergency";

const items = [
    {
        icon: Car,
        iconClass: "text-primary",
        bgClass: "bg-primary-soft",
        title: "Road incidents",
        body: "Stop at a safe distance, switch on hazard lights, avoid moving injured people unless necessary, and call 112 for urgent assistance.",
    },
    {
        icon: Flame,
        iconClass: "text-primary",
        bgClass: "bg-primary-soft",
        title: "Fire safety",
        body: "Move away from smoke and flames, warn people nearby, avoid lifts in buildings, and call 101 or 112 from a safe location.",
    },
    {
        icon: CloudRain,
        iconClass: "text-primary",
        bgClass: "bg-primary-soft",
        title: "Floods and severe weather",
        body: "Avoid flooded roads, low-lying areas, fallen wires, and fast-moving water. Follow official IMD and district advisories.",
    },
    {
        icon: AlertTriangle,
        iconClass: "text-primary",
        bgClass: "bg-primary-soft",
        title: "Report responsibly",
        body: "Pin the exact location and add evidence only when safe. Do not enter a dangerous area or obstruct responders to capture a report.",
    },
    {
        icon: Shield,
        iconClass: "text-primary",
        bgClass: "bg-primary-soft",
        title: "Verify before sharing",
        body: "Check the location, time, and available evidence before confirming an alert. Community reports may be incomplete or inaccurate.",
    },
    {
        icon: Phone,
        iconClass: "text-primary",
        bgClass: "bg-primary-soft",
        title: "India emergency numbers",
        body: `${INDIAN_EMERGENCY.national.number} national · ${INDIAN_EMERGENCY.police.number} police · ${INDIAN_EMERGENCY.ambulance.number} ambulance · ${INDIAN_EMERGENCY.fire.number} fire · ${INDIAN_EMERGENCY.disaster.number} disaster helpline`,
    },
];

export function SafetyBriefing() {
    return (
        <aside className="rounded-[var(--radius-card)] border border-border bg-white p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Stay prepared</p>
                    <h3 className="mt-1 font-display text-xl font-bold text-foreground">Public safety briefing</h3>
                </div>
                <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div key={item.title} className="flex gap-3 border-b border-border pb-4 xl:border-b-0">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-control)] ${item.bgClass}`}>
                                <Icon className={`h-4 w-4 ${item.iconClass}`} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                                <p className="mt-1 text-xs leading-relaxed text-secondary">{item.body}</p>
                                </div>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}
