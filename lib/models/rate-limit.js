import { Schema, model, models } from "mongoose";

const rateLimitSchema = new Schema({
    key: { type: String, required: true, unique: true, index: true },
    count: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, expires: 0 },
}, { versionKey: false });

export const RateLimit = models.RateLimit ?? model("RateLimit", rateLimitSchema);
