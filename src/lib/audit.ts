import AuditLog from "@/models/AuditLog";

type AuditInput = {
  actorUserId: string;
  actorRole: "ADMIN" | "STATION" | "DRIVER";
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ip?: string | null;
};

export async function createAuditLog(input: AuditInput) {
  try {
    await AuditLog.create({
      actorUserId: input.actorUserId,
      actorRole: input.actorRole,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: input.metadata ?? {},
      ip: input.ip ?? undefined,
    });
  } catch (err) {
    console.error("createAuditLog error", err);
  }
}
