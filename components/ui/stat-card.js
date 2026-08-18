import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({ label, value, detail, icon: Icon, tone = "primary", className }) {
    const iconTone = {
        primary: "text-primary",
        danger: "text-destructive",
        warning: "text-[#d97706]",
        success: "text-[#15803d]",
    }[tone];

    return (
        <Card className={cn("gap-0 py-0", className)}>
            <CardContent className="flex items-start justify-between gap-4 p-6">
                <div>
                    <p className="text-sm font-semibold text-slate-600">{label}</p>
                    <p className="mt-2 font-mono text-[2rem] font-semibold leading-none tracking-[-0.03em] text-slate-950">{value}</p>
                    {detail ? <p className="mt-3 text-sm text-slate-500">{detail}</p> : null}
                </div>
                {Icon ? <Icon className={cn("h-5 w-5", iconTone)} aria-hidden="true" /> : null}
            </CardContent>
        </Card>
    );
}
