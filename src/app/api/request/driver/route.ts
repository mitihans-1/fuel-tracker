import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import FuelRequest from "@/models/FuelRequest";

/**
 * GET /api/request/driver
 * Fetches all requests owned by the authenticated driver.
 */
export async function GET() {
  await connectDB();

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Find all requests for this driver, sorted by creation date
    const requests = await FuelRequest.find({ driverId: user.id })
      .populate("stationId", "name location")
      .sort({ createdAt: -1 });

    return NextResponse.json(requests);
  } catch (err) {
    console.error("Error fetching driver requests", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
