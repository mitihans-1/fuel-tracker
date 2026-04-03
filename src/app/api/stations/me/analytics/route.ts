// src/app/api/stations/me/analytics/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Station from "@/models/Station";
import FuelRequest from "@/models/FuelRequest";

export async function GET(req: Request) {
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const stationIdQuery = searchParams.get("stationId");
  
  const query: { ownerUserId: string; _id?: string } = { ownerUserId: decoded.id };
  if (stationIdQuery) query._id = stationIdQuery;

  const station = await Station.findOne(query);
  if (!station) {
    return NextResponse.json({ error: "Station not found" }, { status: 404 });
  }

  const range = searchParams.get("range") || "7d"; // "today" | "7d" | "30d"
  const now = new Date();
  const from = new Date(now);

  if (range === "today") {
    from.setHours(0, 0, 0, 0);
  } else if (range === "30d") {
    from.setDate(from.getDate() - 30);
  } else {
    from.setDate(from.getDate() - 7);
  }

  const baseMatch = {
    stationId: station._id,
    status: { $in: ["APPROVED", "COMPLETED"] },
    paymentStatus: { $ne: "REFUNDED" },
    createdAt: { $gte: from, $lte: now },
  };

  // Total stats
  const totalAgg = await FuelRequest.aggregate([
    { $match: baseMatch },
    {
      $group: {
        _id: null,
        totalLitres: { $sum: "$amount" },
        totalRevenue: { $sum: "$totalPrice" },
        totalStationEarnings: { $sum: "$stationEarning" },
        totalPlatformCommission: { $sum: "$platformCommission" },
        pendingPayoutBalance: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ["$status", "COMPLETED"] }, { $eq: ["$payoutStatus", "PENDING"] }] },
              "$stationEarning",
              0,
            ],
          },
        },
        paidOutTotal: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ["$status", "COMPLETED"] }, { $eq: ["$payoutStatus", "PAID"] }] },
              "$stationEarning",
              0,
            ],
          },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const totals = totalAgg[0] || {
    totalLitres: 0,
    totalRevenue: 0,
    totalStationEarnings: 0,
    totalPlatformCommission: 0,
    pendingPayoutBalance: 0,
    paidOutTotal: 0,
    count: 0,
  };

  // By day (time-series)
  const byDay = await FuelRequest.aggregate([
    { $match: baseMatch },
    {
      $group: {
        _id: {
          y: { $year: "$createdAt" },
          m: { $month: "$createdAt" },
          d: { $dayOfMonth: "$createdAt" },
        },
        litres: { $sum: "$amount" },
        revenue: { $sum: "$totalPrice" },
      },
    },
    { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } },
  ]);

  // Fuel mix
  const byFuel = await FuelRequest.aggregate([
    { $match: baseMatch },
    {
      $group: {
        _id: "$fuelType",
        litres: { $sum: "$amount" },
        revenue: { $sum: "$totalPrice" },
      },
    },
  ]);

  // Peak hours
  const byHour = await FuelRequest.aggregate([
    { $match: baseMatch },
    {
      $group: {
        _id: { $hour: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id": 1 } },
  ]);

  return NextResponse.json({
    totals,
    byDay,
    byFuel,
    byHour,
  });
}