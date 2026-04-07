import { connectDB } from "@/lib/db";
import Rating from "@/models/Rating";
import { NextResponse } from "next/server";

// GET /api/stations/[id]/reviews
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const reviews = await Rating.find({ stationId: id })
      .populate("driverId", "name")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    return NextResponse.json(reviews);
  } catch (err) {
    console.error("reviews error", err);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
