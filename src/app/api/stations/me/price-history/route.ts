import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Station from "@/models/Station";
import PriceHistory from "@/models/PriceHistory";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "STATION") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const stationIdQuery = searchParams.get("stationId");

    const query: any = { ownerUserId: decoded.id };
    if (stationIdQuery) query._id = stationIdQuery;

    const station = await Station.findOne(query);
    if (!station) return NextResponse.json({ error: "Station not found" }, { status: 404 });

    const history = await PriceHistory.find({ stationId: station._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json(history);
  } catch (err) {
    console.error("price-history error", err);
    return NextResponse.json({ error: "Failed to fetch price history" }, { status: 500 });
  }
}
