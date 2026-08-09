import { connectToDatabase } from "@/lib/mongodb";
import { publishHazardUpdate } from "@/lib/hazard-events";
import { Hazard } from "@/lib/models/hazard";
import { distanceInKm, MAX_VOTE_DISTANCE_KM } from "@/lib/vote-proximity";

const PUBLIC_LOCATION_DECIMALS = 3;

export function publicHazard(hazard) {
    const { reportedByUserId: _reportedByUserId, votedUserIds: _votedUserIds, ...safeHazard } = hazard;
    const lat = Number(hazard.lat);
    const lng = Number(hazard.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng))
        return safeHazard;
    return {
        ...safeHazard,
        // Public maps show an approximate location (~100m), while the exact point remains protected in storage.
        lat: Number(lat.toFixed(PUBLIC_LOCATION_DECIMALS)),
        lng: Number(lng.toFixed(PUBLIC_LOCATION_DECIMALS)),
    };
}
export async function listHazards() {
    await connectToDatabase();
    const hazards = await Hazard.find({
        $or: [
            { status: { $exists: false } },
            { status: "active", moderationStatus: { $in: ["published", null] }, expiresAt: { $gt: new Date() } },
        ],
    }).sort({ createdAt: -1 }).lean();
    return hazards.map(publicHazard);
}
export async function createHazard(input, id) {
    await connectToDatabase();
    const hazard = await Hazard.create({
        ...input,
        location: { type: "Point", coordinates: [input.lng, input.lat] },
        ...(id ? { id } : {}),
        reports: 1,
        upvotes: 0,
        downvotes: 0,
        createdAt: new Date().toISOString(),
        status: "active",
        moderationStatus: "published",
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
        deleteAfter: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });
    publishHazardUpdate({ action: "created", hazardId: hazard.id });
    return hazard;
}

export async function findNearbyHazards({ lat, lng, radiusKm }) {
    await connectToDatabase();
    const hazards = await Hazard.find({
        status: "active",
        moderationStatus: { $in: ["published", null] },
        expiresAt: { $gt: new Date() },
        location: {
            $near: {
                $geometry: { type: "Point", coordinates: [lng, lat] },
                $maxDistance: radiusKm * 1000,
            },
        },
    }).limit(100).lean();
    return hazards.map(publicHazard);
}

export async function expireStaleHazards() {
    await connectToDatabase();
    const result = await Hazard.updateMany({
        status: "active",
        expiresAt: { $lte: new Date() },
    }, {
        $set: {
            status: "expired",
            resolvedAt: new Date(),
            resolutionReason: "Automatically expired after six hours without a confirmation.",
        },
    });
    if (result.modifiedCount > 0)
        publishHazardUpdate({ action: "expired", count: result.modifiedCount });
    return result.modifiedCount;
}

export async function confirmHazardActive(id, userId) {
    await connectToDatabase();
    const hazard = await Hazard.findOneAndUpdate({
        id,
        reportedByUserId: userId,
        status: "active",
    }, {
        $set: { expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000) },
    }, { new: true }).lean();
    if (hazard)
        publishHazardUpdate({ action: "confirmed-active", hazardId: hazard.id });
    return hazard;
}
export async function voteHazard(id, userId, direction, voterLocation) {
    await connectToDatabase();
    const reportedHazard = await Hazard.findOne({ id }).select({ lat: 1, lng: 1, location: 1 }).lean();
    if (!reportedHazard)
        return { reason: "not-found" };
    const hazardLocation = reportedHazard.location?.coordinates
        ? { lat: reportedHazard.location.coordinates[1], lng: reportedHazard.location.coordinates[0] }
        : { lat: reportedHazard.lat, lng: reportedHazard.lng };
    const distanceKm = distanceInKm(voterLocation, hazardLocation);
    if (distanceKm > MAX_VOTE_DISTANCE_KM)
        return { reason: "too-far", distanceKm };
    const voteField = direction === "up" ? "upvotes" : "downvotes";
    const hazard = await Hazard.findOneAndUpdate({
        id,
        votedUserIds: { $ne: userId },
    }, {
        $inc: { [voteField]: 1 },
        $addToSet: { votedUserIds: userId },
    }, { new: true }).lean();
    if (hazard) {
        publishHazardUpdate({ action: "voted", hazardId: hazard.id });
        return { hazard };
    }
    return { reason: "already-voted" };
}
