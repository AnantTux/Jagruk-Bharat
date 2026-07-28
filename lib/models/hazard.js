import { randomUUID } from "crypto";
import { Schema, model, models } from "mongoose";
const hazardSchema = new Schema({
    id: { type: String, default: () => randomUUID().toString(), unique: true, index: true },
    type: { type: String, required: true, trim: true },
    severity: { type: String, enum: ["low", "medium", "high"], required: true },
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
    description: { type: String, trim: true },
    locationDescription: { type: String, trim: true },
    reports: { type: Number, default: 1, min: 0 },
    upvotes: { type: Number, default: 0, min: 0 },
    downvotes: { type: Number, default: 0, min: 0 },
    emergency: { type: Boolean, default: false },
    photoUrls: [{ type: String }],
    createdAt: { type: String, default: () => new Date().toISOString(), index: true },
}, { versionKey: false });
export const Hazard = models.Hazard ?? model("Hazard", hazardSchema);
