import { NextResponse } from "next/server";
import { getCurrentUser, publicUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models/user";
import { isAdmin } from "@/lib/roles";

export async function GET(request) {
    const actor = await getCurrentUser();
    if (!isAdmin(actor))
        return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
    if (query.length < 2)
        return NextResponse.json({ users: [] });
    await connectToDatabase();
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const users = await User.find({
        $or: [
            { email: { $regex: escaped, $options: "i" } },
            { firstName: { $regex: escaped, $options: "i" } },
            { lastName: { $regex: escaped, $options: "i" } },
        ],
    }).sort({ createdAt: -1 }).limit(20).lean();
    return NextResponse.json({ users: users.map(publicUser) });
}
