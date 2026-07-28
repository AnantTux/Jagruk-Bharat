import { NextResponse } from "next/server";
import { parseCoordinateQuery } from "@/lib/hazard-utils";
export const dynamic = "force-dynamic";
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    if (!q) {
        return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }
    const coords = parseCoordinateQuery(q);
    if (coords) {
        return NextResponse.json({
            lat: coords.lat,
            lng: coords.lng,
            label: `${coords.lat.toFixed(4)}°, ${coords.lng.toFixed(4)}°`,
        });
    }
    try {
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.searchParams.set("format", "json");
        url.searchParams.set("q", q);
        url.searchParams.set("countrycodes", "in");
        url.searchParams.set("limit", "1");
        const res = await fetch(url.toString(), {
            headers: { "User-Agent": "AnantTatt-Coastal-Hazard-Map/1.0" },
            next: { revalidate: 0 },
        });
        if (!res.ok) {
            return NextResponse.json({ error: "Geocoding failed" }, { status: 502 });
        }
        const results = (await res.json());
        if (results.length === 0) {
            return NextResponse.json({ error: "Location not found" }, { status: 404 });
        }
        const hit = results[0];
        return NextResponse.json({
            lat: Number(hit.lat),
            lng: Number(hit.lon),
            label: hit.display_name,
        });
    }
    catch {
        return NextResponse.json({ error: "Geocoding unavailable" }, { status: 502 });
    }
}
