import { NextResponse } from "next/server";
import { waitForHazardUpdate } from "@/lib/hazard-events";

export const dynamic = "force-dynamic";

const DEFAULT_TIMEOUT_MS = 25000;
const MAX_TIMEOUT_MS = 25000;

export async function GET(request) {
    const requestedTimeout = Number(new URL(request.url).searchParams.get("timeout"));
    const timeoutMs = Number.isFinite(requestedTimeout)
        ? Math.max(1000, Math.min(requestedTimeout, MAX_TIMEOUT_MS))
        : DEFAULT_TIMEOUT_MS;
    const event = await waitForHazardUpdate({ timeoutMs, signal: request.signal });

    return NextResponse.json({ event }, {
        headers: {
            "Cache-Control": "no-store, max-age=0",
        },
    });
}
