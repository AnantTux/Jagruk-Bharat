import { connectToDatabase } from "@/lib/mongodb";
import { Hazard } from "@/lib/models/hazard";
import { publicHazard } from "@/lib/hazard-store";
import { getSampleDataVisible, hideSampleDataFilter } from "@/lib/sample-data-settings";

export const dynamic = "force-dynamic";

const escapeCsv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export async function GET() {
    try {
        await connectToDatabase();
        const sampleDataVisible = await getSampleDataVisible();
        const hazards = await Hazard.find({ status: "active", moderationStatus: { $in: ["published", null] }, expiresAt: { $gt: new Date() }, ...hideSampleDataFilter(sampleDataVisible) }).sort({ createdAt: -1 }).lean();
        const rows = [["id", "title", "type", "severity", "emergency", "verification", "upvotes", "latitude_approx", "longitude_approx", "created_at"]];
        for (const hazard of hazards) {
            const safe = publicHazard(hazard);
            rows.push([safe.id, safe.title, safe.type, safe.severity, safe.emergency, safe.verificationStatus, safe.upvotes, safe.lat, safe.lng, safe.createdAt]);
        }
        return new Response(rows.map((row) => row.map(escapeCsv).join(",")).join("\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=jagruk-bharat-public-hazards.csv", "Cache-Control": "no-store" } });
    }
    catch (error) {
        console.error("Unable to export hazards", error);
        return Response.json({ error: "Public hazard export is temporarily unavailable." }, { status: 503 });
    }
}
