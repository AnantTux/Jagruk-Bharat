import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Suspense } from "react";
import "./globals.css";
import 'leaflet/dist/leaflet.css';
export const metadata = {
    title: "Jagruk Bharat — India Safety Network",
    description: "Community-powered public hazard reporting and live safety mapping across India.",
};
export default function RootLayout({ children, }) {
    return (_jsx("html", { lang: "en", children: _jsx("body", { className: `font-sans ${GeistSans.variable} ${GeistMono.variable}`, children: _jsx(Suspense, { fallback: null, children: children }) }) }));
}
