import { CircleHelp } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({ icon: Icon = CircleHelp, message, action, className }) {
    return (
        <div className={cn("flex min-h-40 flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-dashed border-border bg-[#f7f9f9] px-6 py-8 text-center", className)}>
            <Icon className="h-6 w-6 text-slate-500" aria-hidden="true" />
            <p className="max-w-md text-sm text-slate-600">{message}</p>
            {action ?? null}
        </div>
    );
}
