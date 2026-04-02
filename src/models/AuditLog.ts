import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    actorRole: {
      type: String,
      enum: ["ADMIN", "STATION", "DRIVER"],
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    targetType: {
      type: String,
      required: true,
    },
    targetId: {
      type: String,
      required: false,
    },
    metadata: {
      type: Object,
      default: {},
    },
    ip: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.AuditLog ||
  mongoose.model("AuditLog", auditLogSchema);
