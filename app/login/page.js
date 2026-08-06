"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteFooter } from "@/components/site-footer";

export default function LoginPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        setError("");
        const form = new FormData(event.currentTarget);
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.error || "Unable to sign in.");
            const nextPath = new URLSearchParams(window.location.search).get("next") === "/report" ? "/report" : "/dashboard";
            router.push(nextPath);
            router.refresh();
        }
        catch (loginError) {
            setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
        }
        finally {
            setSubmitting(false);
        }
    }

    return <div className="flex min-h-screen flex-col bg-slate-900">
        <main className="flex flex-1 items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Link href="/" className="mb-6 inline-flex items-center text-sm text-slate-400 hover:text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Link>
                <Card className="border-slate-700 bg-slate-800/90 shadow-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400">
                            <ShieldCheck className="h-7 w-7 text-slate-800" />
                        </div>
                        <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
                        <CardDescription className="text-slate-300">Sign in with your verified Jagruk Bharat account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && <p role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-white">Email Address</Label>
                                <Input id="email" name="email" type="email" autoComplete="email" required className="h-11 border-slate-600 bg-slate-700 text-white" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label htmlFor="password" className="text-white">Password</Label>
                                    <Link href="/forgot-password" className="text-sm text-amber-400 hover:text-amber-300">Forgot password?</Link>
                                </div>
                                <Input id="password" name="password" type="password" autoComplete="current-password" required className="h-11 border-slate-600 bg-slate-700 text-white" />
                            </div>
                            <Button disabled={submitting} className="h-11 w-full bg-amber-400 text-slate-900 hover:bg-amber-500">
                                <Shield className="mr-2 h-4 w-4" /> {submitting ? "Signing in…" : "Sign In"}
                            </Button>
                        </form>
                        <p className="mt-6 text-center text-sm text-slate-400">Don&apos;t have an account? <Link href="/signup" className="font-medium text-amber-400">Sign up here</Link></p>
                    </CardContent>
                </Card>
            </div>
        </main>
        <SiteFooter compact />
    </div>;
}
