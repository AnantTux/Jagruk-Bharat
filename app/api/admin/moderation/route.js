import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ContentFlag } from "@/lib/models/content-flag";
import { Hazard } from "@/lib/models/hazard";
import { writeAuditLog } from "@/lib/audit";
import { isStaff } from "@/lib/roles";
import { requireSameOrigin } from "@/lib/request-security";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
    const user = await getCurrentUser();
    if (!isStaff(user))
        return NextResponse.json({ error: "Moderator access required." }, { status: 403 });
    await connectToDatabase();
    return NextResponse.json({ flags: await ContentFlag.find({ status: "open" }).sort({ createdAt: 1 }).limit(100).lean() });
}

export async function PATCH(request) {
    const crossSiteResponse = requireSameOrigin(request);
    if (crossSiteResponse)
        return crossSiteResponse;
    const user = await getCurrentUser();
    if (!isStaff(user))
        return NextResponse.json({ error: "Moderator access required." }, { status: 403 });
    let body;
    try { body = await request.json(); }
    catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
    if (!body.flagId || !["hide", "dismiss", "reject"].includes(body.decision))
        return NextResponse.json({ error: "Invalid moderation decision." }, { status: 400 });
    await connectToDatabase();
    const flag = await ContentFlag.findById(body.flagId);
    if (!flag || flag.status !== "open")
        return NextResponse.json({ error: "Open moderation case not found." }, { status: 404 });
    flag.status = body.decision === "dismiss" ? "dismissed" : "reviewed";
    flag.decision = body.decision;
    flag.reviewedByUserId = user._id;
    flag.reviewedAt = new Date();
    await flag.save();
    if (body.decision !== "dismiss")
        await Hazard.updateOne({ id: flag.hazardId }, { moderationStatus: body.decision === "hide" ? "hidden" : "rejected" });
    await writeAuditLog({ actorUserId: user._id, action: "moderation.reviewed", targetType: "hazard", targetId: flag.hazardId, metadata: { decision: body.decision, flagId: String(flag._id) } });
    return NextResponse.json({ success: true });
}
