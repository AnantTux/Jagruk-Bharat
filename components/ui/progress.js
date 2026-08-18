"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";
function Progress({ className, value, ...props }) {
    return (_jsx(ProgressPrimitive.Root, { "data-slot": "progress", className: cn("bg-[#cbd5e1] relative h-1.5 w-full overflow-hidden rounded-[2px]", className), ...props, children: _jsx(ProgressPrimitive.Indicator, { "data-slot": "progress-indicator", className: "bg-primary h-full w-full flex-1 transition-all", style: { transform: `translateX(-${100 - (value || 0)}%)` } }) }));
}
export { Progress };
