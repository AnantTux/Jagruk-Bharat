import { NextResponse } from "next/server";
import { findNearbyHazards } from "@/lib/hazard-store";

const MAX_RADIUS_KM = 50;

export const dynamic = "force-dynamic";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const lat = Number(searchParams.get("lat"));
    const lng = Number(searchParams.get("lng"));
    const radiusKm = Number(searchParams.get("radiusKm") ?? 5);

    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180
        || !Number.isFinite(radiusKm) || radiusKm <= 0 || radiusKm > MAX_RADIUS_KM) {
        return NextResponse.json({ error: "Provide valid lat, lng, and a radius up to 50 km." }, { status: 400 });
    }

    return NextResponse.json({
        hazards: await findNearbyHazards({ lat, lng, radiusKm }),
    }, { headers: { "Cache-Control": "no-store" } });
}
