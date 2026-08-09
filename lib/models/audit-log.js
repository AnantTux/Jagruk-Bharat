import { Schema, model, models } from "mongoose";

const auditLogSchema = new Schema({
    actorUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    action: { type: String, required: true, maxlength: 100, index: true },
    targetType: { type: String, required: true, maxlength: 50 },
    targetId: { type: String, required: true, maxlength: 100, index: true },
    metadata: { type: Schema.Types.Mixed },
    ip: { type: String, maxlength: 100 },
}, { timestamps: true, versionKey: false });

export const AuditLog = models.AuditLog ?? model("AuditLog", auditLogSchema);
