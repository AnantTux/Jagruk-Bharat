"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFirebaseAuth } from "@/lib/firebase-client";
import { signOut } from "firebase/auth";

function GuidelinesMenu({ light }) {
    return (
        <details className="relative z-[60]">
            <summary className={`flex h-10 cursor-pointer list-none items-center gap-1 rounded-[var(--radius-control)] px-3 text-sm font-semibold outline-none focus-visible:ring-3 ${light ? "text-white hover:bg-white/10 focus-visible:ring-white/35" : "text-slate-700 hover:bg-[#e1effb] hover:text-[#093f78] focus-visible:ring-primary/25"}`}>
                <BookOpen className="h-4 w-4" /> Guidelines <ChevronDown className="h-3.5 w-3.5" />
            </summary>
            <div className="absolute right-0 z-[70] mt-2 w-80 rounded-[var(--radius-control)] border border-border bg-white p-2 shadow-[0_2px_8px_rgba(15,23,42,0.12)]">
                <Link href="/guidelines" className="block rounded-[var(--radius-control)] px-3 py-2.5 hover:bg-[#e1effb]">
                    <span className="block text-sm font-semibold text-slate-900">Hazard safety guidelines</span>
                    <span className="mt-1 block text-xs leading-relaxed text-slate-600">Public safety advice, emergency protocols, and responsible reporting.</span>
                </Link>
                <Link href="/guidelines/workflow" className="mt-1 block rounded-[var(--radius-control)] px-3 py-2.5 hover:bg-[#e1effb]">
                    <span className="block text-sm font-semibold text-slate-900">Application walkthrough &amp; workflow</span>
                    <span className="mt-1 block text-xs leading-relaxed text-slate-600">How to report, verify, and understand the admin approval process.</span>
                </Link>
            </div>
        </details>
    );
}

export function AuthNav({ light = false, showDashboard = true }) {
    const router = useRouter();
    const [user, setUser] = useState(undefined);

    useEffect(() => {
        let active = true;
        void fetch("/api/auth/session", { cache: "no-store" })
            .then((response) => response.json())
            .then((data) => active && setUser(data.user ?? null))
            .catch(() => active && setUser(null));
        return () => { active = false; };
    }, []);

    async function logout() {
        await fetch("/api/auth/logout", { method: "POST" });
        try { await signOut(getFirebaseAuth()); }
        catch { /* The server session was still cleared. */ }
        setUser(null);
        router.push("/");
        router.refresh();
    }

    const text = light ? "text-white hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-[#e1effb] hover:text-[#093f78]";
    if (user === undefined) return <div className={`h-9 w-36 animate-pulse rounded-md ${light ? "bg-white/20" : "bg-blue-50"}`} />;
    if (!user) return <>
        <GuidelinesMenu light={light} />
        <Button variant="ghost" className={text} asChild><Link href="/report">Report hazard</Link></Button>
        <Button variant="ghost" className={text} asChild><Link href="/analytics">Analytics</Link></Button>
        {showDashboard && <Button variant="ghost" className={text} asChild><Link href="/dashboard">Dashboard</Link></Button>}
        <Button variant="ghost" className={text} asChild><Link href="/login">Sign in</Link></Button>
        <Button asChild><Link href="/signup">Join</Link></Button>
    </>;
    return <>
        <GuidelinesMenu light={light} />
        <Button variant="ghost" className={text} asChild><Link href="/report">Report hazard</Link></Button>
        <Button variant="ghost" className={text} asChild><Link href="/analytics">Analytics</Link></Button>
        <span className={`text-sm ${light ? "text-[#dbeafe]" : "text-slate-700"}`}>Hi, {user.firstName}</span>
        {showDashboard && <Button variant="outline" className={light ? "border-white/70 bg-transparent text-white hover:border-white hover:bg-white/10 hover:text-white active:bg-white/20 active:text-white" : ""} asChild><Link href="/dashboard">Dashboard</Link></Button>}
        {user.role === "admin" && <Button variant="outline" className={light ? "border-white/70 bg-transparent text-white hover:border-white hover:bg-white/10 hover:text-white active:bg-white/20 active:text-white" : ""} asChild><Link href="/admin">Admin</Link></Button>}
        <Button variant="ghost" onClick={logout} className={text}>Log out</Button>
    </>;
}
