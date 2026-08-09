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
            <summary className={`flex cursor-pointer list-none items-center gap-1 rounded-md px-3 py-2 text-sm font-medium ${light ? "text-white hover:bg-white/15" : "text-slate-700 hover:bg-blue-50 hover:text-blue-800"}`}>
                <BookOpen className="h-4 w-4" /> Guidelines <ChevronDown className="h-3.5 w-3.5" />
            </summary>
            <div className="absolute right-0 z-[70] mt-2 w-80 rounded-lg border border-blue-200 bg-white p-2 shadow-lg">
                <Link href="/guidelines" className="block rounded-md px-3 py-2.5 hover:bg-blue-50">
                    <span className="block text-sm font-semibold text-slate-900">Hazard safety guidelines</span>
                    <span className="mt-1 block text-xs leading-relaxed text-slate-600">Public safety advice, emergency protocols, and responsible reporting.</span>
                </Link>
                <Link href="/guidelines/workflow" className="mt-1 block rounded-md px-3 py-2.5 hover:bg-blue-50">
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

    const text = light ? "text-white hover:bg-white/15 hover:text-white" : "text-slate-700 hover:bg-blue-50 hover:text-blue-800";
    if (user === undefined) return <div className={`h-9 w-36 animate-pulse rounded-md ${light ? "bg-white/20" : "bg-blue-50"}`} />;
    if (!user) return <>
        <GuidelinesMenu light={light} />
        <Button variant="ghost" className={text} asChild><Link href="/report">Report hazard</Link></Button>
        <Button variant="ghost" className={text} asChild><Link href="/analytics">Analytics</Link></Button>
        {showDashboard && <Button variant="ghost" className={text} asChild><Link href="/dashboard">Dashboard</Link></Button>}
        <Button variant="ghost" className={text} asChild><Link href="/login">Sign in</Link></Button>
        <Button className="bg-blue-600 font-bold text-white hover:bg-blue-500" asChild><Link href="/signup">Join</Link></Button>
    </>;
    return <>
        <GuidelinesMenu light={light} />
        <Button variant="ghost" className={text} asChild><Link href="/report">Report hazard</Link></Button>
        <Button variant="ghost" className={text} asChild><Link href="/analytics">Analytics</Link></Button>
        <span className={`text-sm ${light ? "text-blue-100" : "text-slate-700"}`}>Hi, {user.firstName}</span>
        {showDashboard && <Button variant="outline" className={light ? "border-white/70 !bg-transparent text-white hover:!bg-white/20" : "border-blue-600 text-blue-700 hover:bg-blue-50"} asChild><Link href="/dashboard">Dashboard</Link></Button>}
        {user.role === "admin" && <Button variant="outline" className={light ? "border-white/70 !bg-transparent text-white hover:!bg-white/20" : "border-blue-700 text-blue-800 hover:bg-blue-50"} asChild><Link href="/admin">Admin</Link></Button>}
        <Button variant="ghost" onClick={logout} className={text}>Log out</Button>
    </>;
}
