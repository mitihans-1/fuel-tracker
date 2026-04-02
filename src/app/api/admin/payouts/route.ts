import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import FuelRequest from "@/models/FuelRequest";
import { createAuditLog } from "@/lib/audit";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const decoded = token ? verifyToken(token) : null;
  if (!decoded || decoded.role !== "ADMIN") return null;
  return decoded;
}

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    await connectDB();

    const baseMatch = {
      paymentStatus: "PAID",
      status: "COMPLETED",
      refundStatus: { $ne: "PROCESSED" },
      stationEarning: { $gt: 0 },
    };

    const byStation = await FuelRequest.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: "$stationId",
          pendingAmount: {
            $sum: {
              $cond: [{ $eq: ["$payoutStatus", "PENDING"] }, "$stationEarning", 0],
            },
          },
          paidAmount: {
            $sum: {
              $cond: [{ $eq: ["$payoutStatus", "PAID"] }, "$stationEarning", 0],
            },
          },
          pendingCount: {
            $sum: {
              $cond: [{ $eq: ["$payoutStatus", "PENDING"] }, 1, 0],
            },
          },
          paidCount: {
            $sum: {
              $cond: [{ $eq: ["$payoutStatus", "PAID"] }, 1, 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: "stations",
          localField: "_id",
          foreignField: "_id",
          as: "station",
        },
      },
      { $unwind: { path: "$station", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          stationId: "$_id",
          stationName: { $ifNull: ["$station.name", "Unknown Station"] },
          pendingAmount: 1,
          paidAmount: 1,
          pendingCount: 1,
          paidCount: 1,
        },
      },
      { $sort: { pendingAmount: -1, stationName: 1 } },
    ]);

    const totals = byStation.reduce(
      (acc, s) => {
        acc.pendingAmount += Number(s.pendingAmount || 0);
        acc.paidAmount += Number(s.paidAmount || 0);
        acc.pendingCount += Number(s.pendingCount || 0);
        acc.paidCount += Number(s.paidCount || 0);
        return acc;
      },
      { pendingAmount: 0, paidAmount: 0, pendingCount: 0, paidCount: 0 }
    );

    return NextResponse.json({ totals, stations: byStation });
  } catch (err) {
    console.error("admin/payouts GET error", err);
    return NextResponse.json({ error: "Failed to load payouts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    await connectDB();
    const body = await req.json();
    const stationId = typeof body.stationId === "string" ? body.stationId : "";
    const requestIds = Array.isArray(body.requestIds) ? body.requestIds : [];

    const match: Record<string, unknown> = {
      paymentStatus: "PAID",
      status: "COMPLETED",
      payoutStatus: "PENDING",
      refundStatus: { $ne: "PROCESSED" },
      stationEarning: { $gt: 0 },
    };

    if (stationId) {
      if (!mongoose.Types.ObjectId.isValid(stationId)) {
        return NextResponse.json({ error: "Invalid stationId" }, { status: 400 });
      }
      match.stationId = new mongoose.Types.ObjectId(stationId);
    } else if (requestIds.length > 0) {
      const validIds = requestIds.filter((id: string) => mongoose.Types.ObjectId.isValid(id));
      if (validIds.length === 0) {
        return NextResponse.json({ error: "No valid request ids" }, { status: 400 });
      }
      match._id = { $in: validIds.map((id: string) => new mongoose.Types.ObjectId(id)) };
    } else {
      return NextResponse.json({ error: "Provide stationId or requestIds" }, { status: 400 });
    }

    const payoutAt = new Date();
    const updateRes = await FuelRequest.updateMany(match, {
      $set: { payoutStatus: "PAID", payoutAt },
    });

    await createAuditLog({
      actorUserId: admin.id,
      actorRole: "ADMIN",
      action: "PAYOUT_SETTLED",
      targetType: "FuelRequest",
      metadata: {
        stationId: stationId || null,
        requestIds: requestIds.length ? requestIds : null,
        modifiedCount: updateRes.modifiedCount ?? 0,
        payoutAt,
      },
    });

    return NextResponse.json({
      success: true,
      paidCount: updateRes.modifiedCount ?? 0,
      payoutAt,
    });
  } catch (err) {
    console.error("admin/payouts POST error", err);
    return NextResponse.json({ error: "Failed to settle payouts" }, { status: 500 });
  }
}
