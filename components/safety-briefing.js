import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Car, CloudRain, Flame, Phone, Shield } from "lucide-react";
import { INDIAN_EMERGENCY } from "@/lib/emergency";

const items = [
    {
        icon: Car,
        iconClass: "text-blue-600",
        bgClass: "bg-blue-50",
        title: "Road incidents",
        body: "Stop at a safe distance, switch on hazard lights, avoid moving injured people unless necessary, and call 112 for urgent assistance.",
    },
    {
        icon: Flame,
        iconClass: "text-blue-600",
        bgClass: "bg-blue-50",
        title: "Fire safety",
        body: "Move away from smoke and flames, warn people nearby, avoid lifts in buildings, and call 101 or 112 from a safe location.",
    },
    {
        icon: CloudRain,
        iconClass: "text-blue-600",
        bgClass: "bg-blue-50",
        title: "Floods and severe weather",
        body: "Avoid flooded roads, low-lying areas, fallen wires, and fast-moving water. Follow official IMD and district advisories.",
    },
    {
        icon: AlertTriangle,
        iconClass: "text-blue-600",
        bgClass: "bg-blue-50",
        title: "Report responsibly",
        body: "Pin the exact location and add evidence only when safe. Do not enter a dangerous area or obstruct responders to capture a report.",
    },
    {
        icon: Shield,
        iconClass: "text-blue-600",
        bgClass: "bg-blue-50",
        title: "Verify before sharing",
        body: "Check the location, time, and available evidence before confirming an alert. Community reports may be incomplete or inaccurate.",
    },
    {
        icon: Phone,
        iconClass: "text-blue-600",
        bgClass: "bg-blue-50",
        title: "India emergency numbers",
        body: `${INDIAN_EMERGENCY.national.number} national · ${INDIAN_EMERGENCY.police.number} police · ${INDIAN_EMERGENCY.ambulance.number} ambulance · ${INDIAN_EMERGENCY.fire.number} fire · ${INDIAN_EMERGENCY.disaster.number} disaster helpline`,
    },
];

export function SafetyBriefing() {
    return (
        <aside className="rounded-xl border border-blue-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between border-b border-blue-100 pb-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Stay prepared</p>
                    <h3 className="mt-1 text-xl font-black text-slate-900">Public safety briefing</h3>
                </div>
                <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Card key={item.title} className="border-blue-100 bg-white shadow-none transition-colors hover:border-blue-300 hover:bg-blue-50">
                            <CardContent className="p-3.5">
                                <div className="flex gap-3">
                                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.bgClass}`}>
                                        <Icon className={`h-4 w-4 ${item.iconClass}`} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                                        <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.body}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </aside>
    );
}
