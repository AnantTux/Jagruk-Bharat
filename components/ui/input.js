import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
function Input({ className, type, ...props }) {
    return (_jsx("input", { type: type, "data-slot": "input", className: cn("file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-11 w-full min-w-0 rounded-[var(--radius-control)] border bg-white px-3 py-2 text-base transition-[border-color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-semibold disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-[#cbd5e1] disabled:bg-[#e2e8f0] disabled:text-[#94a3b8] md:text-sm", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25", "aria-invalid:border-destructive aria-invalid:ring-destructive/20", className), ...props }));
}
export { Input };
