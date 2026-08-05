import { Schema, model, models } from "mongoose";

const userSchema = new Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    firstName: { type: String, required: true, trim: true, maxlength: 80 },
    lastName: { type: String, required: true, trim: true, maxlength: 80 },
    region: { type: String, required: true, trim: true, maxlength: 100 },
    role: { type: String, default: "citizen", trim: true, maxlength: 50 },
    passwordHash: { type: String, required: true, select: false },
    emailVerifiedAt: { type: Date, default: null },
    status: { type: String, enum: ["active", "suspended"], default: "active", index: true },
    suspendedAt: { type: Date, default: null },
    suspensionReason: { type: String, default: null, maxlength: 300 },
    notificationsEnabled: { type: Boolean, default: false },
}, { timestamps: true });

export const User = models.User ?? model("User", userSchema);
