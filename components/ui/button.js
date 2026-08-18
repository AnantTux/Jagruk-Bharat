import { jsx as _jsx } from "react/jsx-runtime";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] border text-sm font-semibold transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-[#cbd5e1] disabled:bg-[#e2e8f0] disabled:text-[#94a3b8] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-[#1264b9]/25", {
    variants: {
        variant: {
            default: "border-primary bg-primary text-primary-foreground hover:border-[#0e539d] hover:bg-[#0e539d] active:border-[#093f78] active:bg-[#093f78]",
            destructive: "border-destructive bg-destructive text-white hover:border-[#b91c1c] hover:bg-[#b91c1c] active:border-[#991b1b] active:bg-[#991b1b] focus-visible:ring-destructive/25",
            outline: "border-primary bg-white text-primary hover:border-[#0e539d] hover:bg-[#e1effb] hover:text-[#093f78] active:border-[#093f78] active:bg-[#cfe3f7] active:text-[#093f78]",
            secondary: "border-primary bg-white text-primary hover:border-[#0e539d] hover:bg-[#e1effb] hover:text-[#093f78] active:border-[#093f78] active:bg-[#cfe3f7] active:text-[#093f78]",
            ghost: "border-transparent bg-transparent text-current hover:bg-white/10 active:bg-white/20",
            link: "border-transparent bg-transparent px-0 text-primary underline-offset-4 hover:underline",
        },
        size: {
            default: "h-10 px-4 py-2 has-[>svg]:px-3",
            sm: "h-9 gap-2 px-3 has-[>svg]:px-2.5",
            lg: "h-12 px-6 has-[>svg]:px-4",
            icon: "size-10",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});
function Button({ className, variant, size, asChild = false, ...props }) {
    const Comp = asChild ? Slot : "button";
    return (_jsx(Comp, { "data-slot": "button", className: cn(buttonVariants({ variant, size, className })), ...props }));
}
export { Button, buttonVariants };
