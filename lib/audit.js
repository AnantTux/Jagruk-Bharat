import { connectToDatabase } from "@/lib/mongodb";
import { AuditLog } from "@/lib/models/audit-log";

export async function writeAuditLog({ actorUserId, action, targetType, targetId, metadata, ip }) {
    await connectToDatabase();
    await AuditLog.create({ actorUserId, action, targetType, targetId: String(targetId), metadata, ip });
}
