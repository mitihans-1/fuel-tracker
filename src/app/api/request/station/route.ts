import { connectDB } from "@/lib/db";
import FuelRequest from "@/models/FuelRequest";
import Station from "@/models/Station";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

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
  
 const query: Record<string, string> = {
  ownerUserId: decoded.id as string,
};
  if (stationIdQuery) {
  query._id = stationIdQuery;
}
  const station = await Station.findOne(query);
  if (!station) {
    return NextResponse.json({ error: "Station not found" }, { status: 404 });
  }

  const requests = await FuelRequest.find({ stationId: station._id })
    .populate("driverId")
    .populate("stationId")
    .sort({ createdAt: -1 });

  return NextResponse.json(requests);
}