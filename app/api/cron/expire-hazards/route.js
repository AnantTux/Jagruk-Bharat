import { NextResponse } from "next/server";
import { expireStaleHazards } from "@/lib/hazard-store";
import { reportServerError } from "@/lib/error-reporting";

export const dynamic = "force-dynamic";

export async function GET(request) {
    const secret = process.env.CRON_SECRET;
    const authorization = request.headers.get("authorization");

    if (!secret)
        return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 503 });
    if (authorization !== `Bearer ${secret}`)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const expiredCount = await expireStaleHazards();
        return NextResponse.json({ expiredCount });
    }
    catch (error) {
        reportServerError(error, { message: "Hazard expiry task failed", route: "/api/cron/expire-hazards" });
        return NextResponse.json({ error: "Hazard expiry task failed" }, { status: 500 });
    }
}
