import { connectDB } from "@/lib/db";
import FuelRequest from "@/models/FuelRequest";
import Station from "@/models/Station";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import crypto from "crypto";

interface IStation {
  petrol: boolean;
  petrolQty: number;
  diesel: boolean;
  dieselQty: number;
  [key: string]: string | number | boolean | undefined;
}

const statusSchema = z.enum(["PENDING", "APPROVED", "REJECTED", "COMPLETED", "CANCELED"]);

const updateSchema = z
  .object({
    requestId: z.string().min(1).optional(),
    requestIds: z.array(z.string().min(1)).min(1).optional(),
    status: statusSchema,
  })
  .refine((v) => Boolean(v.requestId) || Boolean(v.requestIds?.length), {
    message: "Provide requestId or requestIds",
  });

export async function PUT(req: Request) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const actor = token ? verifyToken(token) : null;
    if (!actor || !["ADMIN", "STATION", "DRIVER"].includes(actor.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const { requestId, requestIds, status } = parsed.data;
    const targetIds = requestIds?.length ? requestIds : requestId ? [requestId] : [];

    const requests = await FuelRequest.find({ _id: { $in: targetIds } });
    if (actor.role !== "ADMIN") {
      const stationIds = [...new Set(requests.map((r) => String(r.stationId)))];
      const owned = await Station.find({ _id: { $in: stationIds }, ownerUserId: actor.id })
        .select("_id")
        .lean();
      const ownedSet = new Set(owned.map((s) => String(s._id)));
      const unauthorized = requests.some((r) => !ownedSet.has(String(r.stationId)));
      if (unauthorized) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    if (!requests.length) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    for (const currentRequest of requests) {
      // Decrement stock only when the request is marked COMPLETED (served).
      if (status === "COMPLETED" && currentRequest.status !== "COMPLETED") {
        const station = (await Station.findById(currentRequest.stationId)) as IStation | null;
        if (station) {
          const updateField = currentRequest.fuelType === "petrol" ? "petrolQty" : "dieselQty";
          const currentQty = station[updateField] || 0;
          const newQty = Math.max(0, currentQty - (currentRequest.amount || 0));

          await Station.findByIdAndUpdate(currentRequest.stationId, {
            [updateField]: newQty,
            [currentRequest.fuelType]: newQty > 0,
          });
        }
      }
    }

    // Build update payload – include reservation timer + QR token when approving
    const updatePayload: Record<string, unknown> = { status };
    if (status === "APPROVED") {
      updatePayload.reservationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      // assign a unique qrToken per request (handled per-doc below)
    }

    const result = await FuelRequest.updateMany(
      { _id: { $in: targetIds } },
      { $set: updatePayload }
    );

    // Per-request: generate qrToken on APPROVED & send notifications
    if (status === "APPROVED" || status === "REJECTED") {
      for (const req of requests) {
        if (status === "APPROVED") {
          const qrToken = crypto.randomBytes(16).toString("hex");
          await FuelRequest.findByIdAndUpdate(req._id, { qrToken });
        }
        if (req.driverId) {
          const stationDoc = await Station.findById(req.stationId).select("name").lean() as { name?: string } | null;
          const stationName = stationDoc?.name ?? "the station";
          const notifType = status === "APPROVED" ? "REQUEST_APPROVED" : "REQUEST_REJECTED";
          const title = status === "APPROVED" ? "Fuel Request Approved ✓" : "Fuel Request Rejected";
          const message = status === "APPROVED"
            ? `Your ${req.fuelType} request at ${stationName} was approved. You have 15 minutes to collect your fuel.`
            : `Your ${req.fuelType} request at ${stationName} was rejected.`;
          await Notification.create({
            userId: req.driverId,
            type: notifType,
            title,
            message,
          });
        }
      }
    }

    await createAuditLog({
      actorUserId: actor.id,
      actorRole: actor.role as "ADMIN" | "STATION" | "DRIVER",
      action: "REQUEST_STATUS_UPDATE",
      targetType: "FuelRequest",
      metadata: { status, requestCount: targetIds.length, requestIds: targetIds },
    });

    if (requestId && !requestIds) {
      const updated = await FuelRequest.findById(requestId);
      return NextResponse.json(updated);
    }

    return NextResponse.json({
      success: true,
      matched: result.matchedCount,
      modified: result.modifiedCount,
      status,
    });
  } catch (error) {
    console.error("Error updating request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}