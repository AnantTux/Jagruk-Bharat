import { Schema, model, models } from "mongoose";

const contentFlagSchema = new Schema({
    hazardId: { type: String, required: true, index: true },
    reporterUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    reason: { type: String, enum: ["privacy", "misinformation", "abuse", "duplicate", "other"], required: true },
    details: { type: String, trim: true, maxlength: 500 },
    status: { type: String, enum: ["open", "reviewed", "dismissed"], default: "open", index: true },
    reviewedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    decision: { type: String, enum: ["hide", "dismiss", "reject"] },
}, { timestamps: true, versionKey: false });

export const ContentFlag = models.ContentFlag ?? model("ContentFlag", contentFlagSchema);
