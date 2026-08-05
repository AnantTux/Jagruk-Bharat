import { Schema, model, models } from "mongoose";

const authTokenSchema = new Schema({
    tokenHash: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    purpose: { type: String, enum: ["verify-email", "reset-password"], required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true });

authTokenSchema.index({ userId: 1, purpose: 1 });

export const AuthToken = models.AuthToken ?? model("AuthToken", authTokenSchema);
