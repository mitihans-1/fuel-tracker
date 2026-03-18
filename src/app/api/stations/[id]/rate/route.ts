import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Rating from "@/models/Rating";
import Station from "@/models/Station";
import FuelRequest from "@/models/FuelRequest";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "DRIVER") {
      return NextResponse.json({ error: "Only drivers can rate stations" }, { status: 403 });
    }

    const { score, comment } = await req.json();
    if (!score || score < 1 || score > 5) {
      return NextResponse.json({ error: "Score must be between 1 and 5" }, { status: 400 });
    }

    await connectDB();

    const station = await Station.findById(id);
    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    // Ensure driver has at least one approved/completed request at this station
    const hasHistory = await FuelRequest.exists({
      driverId: decoded.id,
      stationId: id,
      status: { $in: ["APPROVED", "COMPLETED"] },
    });

    if (!hasHistory) {
      return NextResponse.json(
        { error: "You can only rate stations you have used" },
        { status: 403 }
      );
    }

    // Upsert rating
    const existing = await Rating.findOne({
      stationId: id,
      driverId: decoded.id,
    });

    let oldScore: number | null = null;
    if (existing) {
      oldScore = existing.score;
      existing.score = score;
      existing.comment = comment;
      await existing.save();
    } else {
      await Rating.create({
        stationId: id,
        driverId: decoded.id,
        score,
        comment,
      });
    }

    // Recalculate station aggregate
    const stats = await Rating.aggregate([
      { $match: { stationId: station._id } },
      {
        $group: {
          _id: "$stationId",
          avg: { $avg: "$score" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      station.avgRating = stats[0].avg;
      station.ratingCount = stats[0].count;
      await station.save();
    }

    return NextResponse.json({
      ok: true,
      avgRating: station.avgRating,
      ratingCount: station.ratingCount,
    });
  } catch (err) {
    console.error("rate station error", err);
    return NextResponse.json(
      { error: "Failed to submit rating" },
      { status: 500 }
    );
  }
}

