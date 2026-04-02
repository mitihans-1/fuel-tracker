import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import FuelRequest from "@/models/FuelRequest";
import Station from "@/models/Station";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const decoded = token ? verifyToken(token) : null;
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30d";
    const now = new Date();
    const from = new Date(now);
    if (range === "7d") {
      from.setDate(from.getDate() - 7);
    } else {
      from.setDate(from.getDate() - 30);
    }

    const baseMatch = {
      createdAt: { $gte: from, $lte: now },
      paymentStatus: { $ne: "REFUNDED" },
    };

    // Requests by day with fuel type breakdown
    const byDay = await FuelRequest.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: {
            y: { $year: "$createdAt" },
            m: { $month: "$createdAt" },
            d: { $dayOfMonth: "$createdAt" },
            fuelType: "$fuelType",
          },
          count: { $sum: 1 },
          litres: { $sum: "$amount" },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } },
    ]);

    // Fuel type breakdown
    const fuelBreakdown = await FuelRequest.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: "$fuelType",
          count: { $sum: 1 },
          litres: { $sum: "$amount" },
          revenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    // Top stations by request count
    const topStations = await FuelRequest.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: "$stationId",
          count: { $sum: 1 },
          revenue: { $sum: "$totalPrice" },
          litres: { $sum: "$amount" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
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
          name: { $ifNull: ["$station.name", "Unknown Station"] },
          count: 1,
          revenue: 1,
          litres: 1,
        },
      },
    ]);

    // Platform totals
    const totalsAgg = await FuelRequest.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: null,
          requests: { $sum: 1 },
          litres: { $sum: "$amount" },
          grossRevenue: { $sum: "$totalPrice" },
          stationEarnings: { $sum: "$stationEarning" },
          platformCommission: { $sum: "$platformCommission" },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] },
          },
        },
      },
    ]);
    const totals = totalsAgg[0] || {
      requests: 0,
      litres: 0,
      grossRevenue: 0,
      stationEarnings: 0,
      platformCommission: 0,
      approved: 0,
      completed: 0,
      pending: 0,
    };

    // Total station count
    const stationCount = await Station.countDocuments();

    return NextResponse.json({ byDay, fuelBreakdown, topStations, totals, stationCount });
  } catch (err) {
    console.error("admin/analytics error", err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
