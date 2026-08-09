import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Hazard } from "@/lib/models/hazard";
import { publicHazard } from "@/lib/hazard-store";

export const dynamic = "force-dynamic";

const visibleHazards = {
    status: "active",
    moderationStatus: { $in: ["published", null] },
    expiresAt: { $gt: new Date() },
};

export async function GET() {
    try {
        await connectToDatabase();
        const [summary, byType, recent] = await Promise.all([
            Hazard.aggregate([
                { $match: visibleHazards },
                { $group: { _id: null, active: { $sum: 1 }, emergency: { $sum: { $cond: ["$emergency", 1, 0] } }, highSeverity: { $sum: { $cond: [{ $eq: ["$severity", "high"] }, 1, 0] } }, adminApproved: { $sum: { $cond: [{ $eq: ["$verificationStatus", "admin-approved"] }, 1, 0] } }, communityVotes: { $sum: "$upvotes" } } },
            ]),
            Hazard.aggregate([{ $match: visibleHazards }, { $group: { _id: "$type", count: { $sum: 1 }, upvotes: { $sum: "$upvotes" } } }, { $sort: { count: -1, _id: 1 } }]),
            Hazard.find(visibleHazards).sort({ createdAt: -1 }).limit(10).lean(),
        ]);
        return NextResponse.json({ summary: summary[0] ?? { active: 0, emergency: 0, highSeverity: 0, adminApproved: 0, communityVotes: 0 }, byType, recent: recent.map(publicHazard) });
    }
    catch (error) {
        console.error("Unable to load analytics", error);
        return NextResponse.json({ error: "Analytics are temporarily unavailable." }, { status: 503 });
    }
}
