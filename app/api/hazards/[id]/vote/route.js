import { NextResponse } from "next/server";
import { voteHazard } from "@/lib/hazard-store";
import { getCurrentUser } from "@/lib/auth";
import { parseVoterLocation } from "@/lib/vote-proximity";
export const dynamic = "force-dynamic";
export async function POST(request, context) {
    const { id } = await context.params;
    let body;
    try {
        body = await request.json();
    }
    catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    if (body.direction !== "up" && body.direction !== "down") {
        return NextResponse.json({ error: "direction must be up or down" }, { status: 400 });
    }
    const voterLocation = parseVoterLocation(body.voterLocation);
    if (!voterLocation) {
        return NextResponse.json({ error: "Allow location access to vote on a nearby hazard." }, { status: 400 });
    }
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Sign in with a verified account to vote." }, { status: 401 });
    }
    const result = await voteHazard(id, user._id, body.direction, voterLocation);
    if (result.reason === "not-found") {
        return NextResponse.json({ error: "Hazard not found" }, { status: 404 });
    }
    if (result.reason === "already-voted") {
        return NextResponse.json({ error: "You have already voted on this hazard." }, { status: 409 });
    }
    if (result.reason === "too-far") {
        return NextResponse.json({ error: "Votes count only within 5 km of the reported hazard." }, { status: 403 });
    }
    return NextResponse.json({ hazard: result.hazard });
}
