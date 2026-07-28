import { connectToDatabase } from "@/lib/mongodb";
import { Hazard } from "@/lib/models/hazard";
export async function listHazards() {
    await connectToDatabase();
    return Hazard.find().sort({ createdAt: -1 }).lean();
}
export async function createHazard(input, id) {
    await connectToDatabase();
    return Hazard.create({
        ...input,
        ...(id ? { id } : {}),
        reports: 1,
        upvotes: 0,
        downvotes: 0,
        createdAt: new Date().toISOString(),
    });
}
export async function voteHazard(id, direction) {
    await connectToDatabase();
    return Hazard.findOneAndUpdate({ id }, { $inc: { [direction === "up" ? "upvotes" : "downvotes"]: 1 } }, { new: true }).lean();
}
