import { NextResponse } from "next/server";
import { destroyCurrentSession } from "@/lib/auth";
import { requireSameOrigin } from "@/lib/request-security";

export async function POST(request) {
    const crossSiteResponse = requireSameOrigin(request);
    if (crossSiteResponse)
        return crossSiteResponse;
    await destroyCurrentSession();
    return NextResponse.json({ success: true });
}
