import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Waves, Map, Camera, TrendingUp } from "lucide-react";
export function Navigation() {
    return (_jsxs("nav", { className: "flex items-center gap-4", children: [_jsx(Link, { href: "/", children: _jsxs(Button, { variant: "ghost", size: "sm", children: [_jsx(Waves, { className: "w-4 h-4 mr-2" }), "Home"] }) }), _jsx(Link, { href: "/dashboard", children: _jsxs(Button, { variant: "ghost", size: "sm", children: [_jsx(Map, { className: "w-4 h-4 mr-2" }), "Map Dashboard"] }) }), _jsx(Link, { href: "/report", children: _jsxs(Button, { variant: "ghost", size: "sm", children: [_jsx(Camera, { className: "w-4 h-4 mr-2" }), "Report Hazard"] }) }), _jsx(Link, { href: "/analytics", children: _jsxs(Button, { variant: "ghost", size: "sm", children: [_jsx(TrendingUp, { className: "w-4 h-4 mr-2" }), "Social Analytics"] }) })] }));
}
