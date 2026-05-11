import { connectDB } from "@/lib/db";
import Station from "@/models/Station";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can verify stations" }, { status: 403 });
    }

    const { stationId, status } = await req.json();

    if (!stationId || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
    }

    await connectDB();
    const station = await Station.findById(stationId);
    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    station.verificationStatus = status;
    await station.save();

    return NextResponse.json({ message: `Station ${status.toLowerCase()} successfully`, station });
  } catch (err) {
    console.error("VERIFY_STATION_ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
