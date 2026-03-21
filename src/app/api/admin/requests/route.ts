import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import FuelRequest from "@/models/FuelRequest";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // SECURITY: Check if user is logged in and is an ADMIN
    const decoded = token ? verifyToken(token) : null;
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    await connectDB();
    const requests = await FuelRequest.find({})
      .populate("driverId", "name email")
      .populate("stationId", "name location")
      .sort({ createdAt: -1 });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Admin Fetch Requests Error:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}