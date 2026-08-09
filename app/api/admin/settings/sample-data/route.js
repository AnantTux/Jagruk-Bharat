import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/roles";
import { requireSameOrigin } from "@/lib/request-security";
import { getSampleDataVisible, setSampleDataVisible } from "@/lib/sample-data-settings";
import { publishHazardUpdate } from "@/lib/hazard-events";

async function requireAdmin() {
    const user = await getCurrentUser();
    return isAdmin(user) ? null : NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
}

export async function GET() {
    const denied = await requireAdmin();
    if (denied) return denied;
    return NextResponse.json({ sampleDataVisible: await getSampleDataVisible() });
}

export async function PATCH(request) {
    const crossSiteResponse = requireSameOrigin(request);
    if (crossSiteResponse) return crossSiteResponse;
    const denied = await requireAdmin();
    if (denied) return denied;
    const body = await request.json();
    if (typeof body.sampleDataVisible !== "boolean")
        return NextResponse.json({ error: "sampleDataVisible must be true or false." }, { status: 400 });
    const sampleDataVisible = await setSampleDataVisible(body.sampleDataVisible);
    publishHazardUpdate({ action: "sample-data-visibility", sampleDataVisible });
    return NextResponse.json({ sampleDataVisible });
}
