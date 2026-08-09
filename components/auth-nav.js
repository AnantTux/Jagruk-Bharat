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
        <details className="relative z-[60]">
            <summary className="flex cursor-pointer list-none items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-800">
                <BookOpen className="h-4 w-4" /> Guidelines <ChevronDown className="h-3.5 w-3.5" />
            </summary>
            <div className="absolute right-0 z-[70] mt-2 w-72 rounded-lg border border-blue-200 bg-white p-2 shadow-lg">
                <Link href="/guidelines" className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-blue-50">Stay prepared</Link>
                <p className="px-3 pb-2 text-xs leading-relaxed text-slate-600">Safety advice, emergency numbers, and responsible reporting guidance.</p>
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

    if (user === undefined) return <div className="h-9 w-36 animate-pulse rounded-md bg-blue-50" />;
    if (!user) return <>
        <GuidelinesMenu />
        <Button variant="ghost" className="text-slate-700 hover:bg-blue-50 hover:text-blue-800" asChild><Link href="/login">Sign in</Link></Button>
        <Button className="bg-blue-600 font-bold text-white hover:bg-blue-500" asChild><Link href="/signup">Join</Link></Button>
    </>;
    return <>
        <GuidelinesMenu />
        <span className="text-sm text-slate-700">Hi, {user.firstName}</span>
        <Button variant="outline" className="border-blue-600 text-blue-700 hover:bg-blue-50" asChild><Link href="/dashboard">Dashboard</Link></Button>
        {user.role === "admin" && <Button variant="outline" className="border-blue-700 text-blue-800 hover:bg-blue-50" asChild><Link href="/admin">Admin</Link></Button>}
        <Button variant="ghost" onClick={logout} className="text-slate-700 hover:bg-blue-50 hover:text-blue-800">Log out</Button>
    </>;
}
