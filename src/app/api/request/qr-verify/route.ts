import { connectDB } from "@/lib/db";
import FuelRequest from "@/models/FuelRequest";
import Station from "@/models/Station";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

// POST /api/request/qr-verify  { qrToken }
// Called by station staff after scanning a driver's QR code.
// Validates the token, checks expiry, and marks request COMPLETED.
export async function POST(req: Request) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const actor = verifyToken(token);
    if (!actor || !["ADMIN", "STATION"].includes(actor.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { qrToken } = body as { qrToken?: string };
    if (!qrToken) return NextResponse.json({ error: "qrToken required" }, { status: 400 });

    const fuelRequest = await FuelRequest.findOne({ qrToken }).populate("driverId", "name").populate("stationId", "name");
    if (!fuelRequest) return NextResponse.json({ error: "Invalid QR code" }, { status: 404 });

    if (fuelRequest.status !== "APPROVED") {
      return NextResponse.json(
        { error: `Request is already ${fuelRequest.status}` },
        { status: 400 }
      );
    }

    // Check reservation timer
    if (fuelRequest.reservationExpiresAt && new Date() > fuelRequest.reservationExpiresAt) {
      await FuelRequest.findByIdAndUpdate(fuelRequest._id, { status: "CANCELED", qrToken: null });
      return NextResponse.json({ error: "Reservation expired – request auto-cancelled" }, { status: 410 });
    }

    // Verify the station owns this request
    if (actor.role === "STATION") {
      const ownedStation = await Station.findOne({ _id: fuelRequest.stationId, ownerUserId: actor.id });
      if (!ownedStation) return NextResponse.json({ error: "Station mismatch" }, { status: 403 });

      // Decrement stock
      const fuelField = fuelRequest.fuelType === "petrol" ? "petrolQty" : "dieselQty";
      const currentQty: number = (ownedStation as Record<string, number>)[fuelField] || 0;
      const newQty = Math.max(0, currentQty - (fuelRequest.amount || 0));
      await Station.findByIdAndUpdate(ownedStation._id, {
        [fuelField]: newQty,
        [fuelRequest.fuelType]: newQty > 0,
      });
    }

    const completed = await FuelRequest.findByIdAndUpdate(
      fuelRequest._id,
      { status: "COMPLETED", qrToken: null },
      { new: true }
    ).populate("driverId", "name").populate("stationId", "name");

    return NextResponse.json({ success: true, request: completed });
  } catch (err) {
    console.error("qr-verify error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
