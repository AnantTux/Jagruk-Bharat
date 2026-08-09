import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { ContentFlag } from "@/lib/models/content-flag";
import { Hazard } from "@/lib/models/hazard";
import { requireSameOrigin } from "@/lib/request-security";
import { connectToDatabase } from "@/lib/mongodb";

const REASONS = new Set(["privacy", "misinformation", "abuse", "duplicate", "other"]);

export async function POST(request, { params }) {
    const crossSiteResponse = requireSameOrigin(request);
    if (crossSiteResponse)
        return crossSiteResponse;
    const user = await getCurrentUser();
    if (!user)
        return NextResponse.json({ error: "Sign in to report harmful content." }, { status: 401 });
    let body;
    try { body = await request.json(); }
    catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
    if (!REASONS.has(body.reason) || (body.details && (typeof body.details !== "string" || body.details.length > 500)))
        return NextResponse.json({ error: "Invalid content report." }, { status: 400 });
    const { id } = await params;
    await connectToDatabase();
    if (!await Hazard.exists({ id }))
        return NextResponse.json({ error: "Hazard not found." }, { status: 404 });
    await ContentFlag.create({ hazardId: id, reporterUserId: user._id, reason: body.reason, details: body.details?.trim() });
    await writeAuditLog({ actorUserId: user._id, action: "hazard.flagged", targetType: "hazard", targetId: id, metadata: { reason: body.reason } });
    return NextResponse.json({ message: "Thanks. This report is now in the moderation queue." }, { status: 201 });
}
