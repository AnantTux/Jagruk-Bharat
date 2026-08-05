import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { confirmHazardActive } from "@/lib/hazard-store";

export async function POST(_request, { params }) {
    const user = await getCurrentUser();
    if (!user)
        return NextResponse.json({ error: "Sign in to confirm your report." }, { status: 401 });

    const { id } = await params;
    const hazard = await confirmHazardActive(id, user._id);
    if (!hazard)
        return NextResponse.json({ error: "Only the original reporter can confirm an active report." }, { status: 404 });
    return NextResponse.json({ hazard });
}
