import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from "next/link";
import { Waves } from "lucide-react";
import { SITE } from "@/lib/site";
export function SiteBrand({ href = "/", subtitle }) {
    return (_jsxs(Link, { href: href, className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400 shadow-lg", children: _jsx(Waves, { className: "h-6 w-6 text-slate-900" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-xl font-bold tracking-tight text-white", children: SITE.name }), _jsx("p", { className: "text-[10px] font-semibold uppercase tracking-widest text-amber-400", children: subtitle ?? SITE.tagline })] })] }));
}
