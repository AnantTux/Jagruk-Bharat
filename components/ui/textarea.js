import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
function Textarea({ className, ...props }) {
    return (_jsx("textarea", { "data-slot": "textarea", className: cn("border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/25 aria-invalid:border-destructive aria-invalid:ring-destructive/20 flex field-sizing-content min-h-24 w-full rounded-[var(--radius-control)] border bg-white px-3 py-2 text-base transition-[border-color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:border-[#cbd5e1] disabled:bg-[#e2e8f0] disabled:text-[#94a3b8] md:text-sm", className), ...props }));
}
export { Textarea };
