import { connectToDatabase } from "@/lib/mongodb";
import { publishHazardUpdate } from "@/lib/hazard-events";
import { Hazard } from "@/lib/models/hazard";
export async function listHazards() {
    await connectToDatabase();
    return Hazard.find().sort({ createdAt: -1 }).lean();
}
export async function createHazard(input, id) {
    await connectToDatabase();
    const hazard = await Hazard.create({
        ...input,
        ...(id ? { id } : {}),
        reports: 1,
        upvotes: 0,
        downvotes: 0,
        createdAt: new Date().toISOString(),
    });
    publishHazardUpdate({ action: "created", hazardId: hazard.id });
    return hazard;
}
export async function voteHazard(id, userId, direction) {
    await connectToDatabase();
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
    const exists = await Hazard.exists({ id });
    return { reason: exists ? "already-voted" : "not-found" };
}
