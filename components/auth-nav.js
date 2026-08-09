"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFirebaseAuth } from "@/lib/firebase-client";
import { signOut } from "firebase/auth";

function GuidelinesMenu() {
    return (
        <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-slate-200 hover:bg-blue-950/60 hover:text-white">
                <BookOpen className="h-4 w-4" /> Guidelines <ChevronDown className="h-3.5 w-3.5" />
            </summary>
            <div className="absolute right-0 z-50 mt-2 w-72 rounded-lg border border-blue-900 bg-slate-950 p-2 shadow-xl">
                <Link href="/guidelines" className="block rounded-md px-3 py-2 text-sm font-semibold text-white hover:bg-blue-950">Stay prepared</Link>
                <p className="px-3 pb-2 text-xs leading-relaxed text-slate-400">Safety advice, emergency numbers, and responsible reporting guidance.</p>
            </div>
        </details>
    );
}

export function AuthNav() {
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

    if (user === undefined) return <div className="h-9 w-36 animate-pulse rounded-md bg-blue-950" />;
    if (!user) return <>
        <GuidelinesMenu />
        <Button variant="ghost" className="text-slate-300 hover:bg-blue-950 hover:text-white" asChild><Link href="/login">Sign in</Link></Button>
        <Button className="bg-blue-600 font-bold text-white hover:bg-blue-500" asChild><Link href="/signup">Join</Link></Button>
    </>;
    return <>
        <GuidelinesMenu />
        <span className="text-sm text-slate-300">Hi, {user.firstName}</span>
        {user.role === "admin" && <Button variant="outline" className="border-blue-700 bg-blue-950/50 text-white hover:bg-blue-900" asChild><Link href="/admin">Admin</Link></Button>}
        <Button variant="ghost" onClick={logout} className="text-slate-300 hover:bg-blue-950 hover:text-white">Log out</Button>
    </>;
}
