import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { User } from "@/lib/models/user";
import { USER_ROLES, isAdmin } from "@/lib/roles";
import { requireSameOrigin } from "@/lib/request-security";
import { connectToDatabase } from "@/lib/mongodb";

export async function PATCH(request, { params }) {
    const crossSiteResponse = requireSameOrigin(request);
    if (crossSiteResponse)
        return crossSiteResponse;
    const actor = await getCurrentUser();
    if (!isAdmin(actor))
        return NextResponse.json({ error: "Administrator access required." }, { status: 403 });

    let body;
    try {
        body = await request.json();
    }
    catch {
        return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    }
    if (!USER_ROLES.includes(body.role))
        return NextResponse.json({ error: "Invalid role." }, { status: 400 });

    const { id } = await params;
    await connectToDatabase();
    const user = await User.findByIdAndUpdate(id, { role: body.role }, { new: true }).lean();
    if (!user)
        return NextResponse.json({ error: "User not found." }, { status: 404 });
    await writeAuditLog({
        actorUserId: actor._id,
        action: "user.role.updated",
        targetType: "user",
        targetId: user._id,
        metadata: { role: body.role },
    });
    return NextResponse.json({ user: { id: String(user._id), role: user.role } });
}
