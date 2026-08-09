"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getFirebaseAuth } from "@/lib/firebase-client";
import { signOut } from "firebase/auth";

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
        try {
            await signOut(getFirebaseAuth());
        }
        catch {
            // The server session is still cleared when Firebase is not configured locally.
        }
        setUser(null);
        router.push("/");
        router.refresh();
    }

    if (user === undefined)
        return <div className="h-9 w-36 animate-pulse rounded-md bg-slate-800" />;
    if (!user)
        return <>
            <Button variant="ghost" className="text-slate-300 hover:text-white" asChild><Link href="/login">Sign In</Link></Button>
            <Button className="bg-amber-400 font-bold text-slate-800 hover:bg-amber-500" asChild><Link href="/signup">Join Jagruk Bharat</Link></Button>
        </>;
    return <>
        <span className="text-sm text-slate-300">Hi, {user.firstName}</span>
        {user.role === "admin" && <Button variant="outline" className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700" asChild><Link href="/admin">Admin</Link></Button>}
        <Button className="bg-amber-400 font-bold text-slate-800 hover:bg-amber-500" asChild><Link href="/dashboard">Dashboard</Link></Button>
        <Button variant="ghost" onClick={logout} className="text-slate-300 hover:text-white">Log out</Button>
    </>;
}
