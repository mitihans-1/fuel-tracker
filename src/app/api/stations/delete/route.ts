import { connectDB } from "@/lib/db";
import Station from "@/models/Station";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || (decoded.role !== "STATION" && decoded.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { stationId } = await req.json();

    if (!stationId) {
      return NextResponse.json({ error: "Station ID is required" }, { status: 400 });
    }

    await connectDB();
    const query = decoded.role === "ADMIN" ? { _id: stationId } : { _id: stationId, ownerUserId: decoded.id };
    const station = await Station.findOne(query);
    if (!station) {
      return NextResponse.json({ error: "Station not found or unauthorized" }, { status: 404 });
    }

    await Station.deleteOne({ _id: stationId });

    return NextResponse.json({ message: "Station deleted successfully" });
  } catch (err) {
    console.error("DELETE_STATION_ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
