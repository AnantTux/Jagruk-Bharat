import { connectToDatabase } from "@/lib/mongodb";
import { publishHazardUpdate } from "@/lib/hazard-events";
import { Hazard } from "@/lib/models/hazard";
import { distanceInKm, MAX_VOTE_DISTANCE_KM } from "@/lib/vote-proximity";
export async function listHazards() {
    await connectToDatabase();
    return Hazard.find({
        $or: [
            { status: { $exists: false } },
            { status: "active", expiresAt: { $gt: new Date() } },
        ],
    }).sort({ createdAt: -1 }).lean();
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
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
    });
    publishHazardUpdate({ action: "created", hazardId: hazard.id });
    return hazard;
}

export async function findNearbyHazards({ lat, lng, radiusKm }) {
    await connectToDatabase();
    return Hazard.find({
        status: "active",
        expiresAt: { $gt: new Date() },
        location: {
            $near: {
                $geometry: { type: "Point", coordinates: [lng, lat] },
                $maxDistance: radiusKm * 1000,
            },
        },
    }).limit(100).lean();
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
