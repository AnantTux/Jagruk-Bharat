import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IBM_Plex_Mono, Public_Sans, Source_Sans_3 } from "next/font/google";
import { Suspense } from "react";
import { QueryProvider } from "@/components/query-provider";
import "./globals.css";
import 'leaflet/dist/leaflet.css';
export const metadata = {
    title: "Jagruk Bharat — India Safety Network",
    description: "Community-powered public hazard reporting and live safety mapping across India.",
};
const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-public-sans", weight: ["600", "700"] });
const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans", weight: ["400", "600"] });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-ibm-plex-mono", weight: ["500", "600"] });
export default function RootLayout({ children, }) {
    return (_jsx("html", { lang: "en", children: _jsx("body", { className: `font-sans ${publicSans.variable} ${sourceSans.variable} ${ibmPlexMono.variable}`, children: _jsx(QueryProvider, { children: _jsx(Suspense, { fallback: null, children: children }) }) }) }));
}
