"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import dynamic from "next/dynamic";
const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
    ssr: false,
    loading: () => _jsx("div", { className: "h-full min-h-[400px] w-full animate-pulse rounded-xl bg-slate-800" }),
});
export function HazardMap(props) {
    const { className, ...rest } = props;
    const isFullHeight = className?.includes("h-full");
    return (_jsx("div", { className: isFullHeight ? "h-full w-full min-h-0" : undefined, children: _jsx(LeafletMap, { ...rest, className: className }) }));
}
