import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import "./globals.css";
import 'leaflet/dist/leaflet.css';
export const metadata = {
    title: "AnantTatt — Endless Coast",
    description: "Real-time coastal hazard mapping and community reporting. AnantTatt: endless coast, built by Anant.",
};
export default function RootLayout({ children, }) {
    return (_jsx("html", { lang: "en", children: _jsxs("body", { className: `font-sans ${GeistSans.variable} ${GeistMono.variable}`, children: [_jsx(Suspense, { fallback: null, children: children }), _jsx(Analytics, {})] }) }));
}
