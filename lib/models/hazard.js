import { randomUUID } from "crypto";
import { Schema, model, models } from "mongoose";
const hazardSchema = new Schema({
    id: { type: String, default: () => randomUUID().toString(), unique: true, index: true },
    type: { type: String, required: true, trim: true },
    severity: { type: String, enum: ["low", "medium", "high"], required: true },
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
    location: {
        type: { type: String, enum: ["Point"], required: true },
        coordinates: { type: [Number], required: true },
    },
    description: { type: String, trim: true },
    locationDescription: { type: String, trim: true },
    reports: { type: Number, default: 1, min: 0 },
    upvotes: { type: Number, default: 0, min: 0 },
    downvotes: { type: Number, default: 0, min: 0 },
    votedUserIds: {
        type: [{ type: Schema.Types.ObjectId, ref: "User" }],
        default: [],
        select: false,
    },
    emergency: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "resolved", "expired"], default: "active", index: true },
    expiresAt: { type: Date, required: true, index: true },
    resolvedAt: { type: Date },
    resolutionReason: { type: String, trim: true },
    photoUrls: [{ type: String }],
    reportedByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, select: false, index: true },
    createdAt: { type: String, default: () => new Date().toISOString(), index: true },
}, { versionKey: false });
hazardSchema.index({ location: "2dsphere" });
export const Hazard = models.Hazard ?? model("Hazard", hazardSchema);
