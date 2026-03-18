import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Request from "@/models/FuelRequest";
import Station from "@/models/Station";

/**
 * DELETE /api/request/driver/:id
 * Cancels a pending request owned by the authenticated driver.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing request id" }, { status: 400 });
    }

    const reqDoc = await Request.findById(id);
    if (!reqDoc) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (String(reqDoc.driverId) !== String(user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (reqDoc.status !== "PENDING") {
      return NextResponse.json({ error: "Only pending requests can be canceled" }, { status: 400 });
    }

    // Restore fuel quantity to station before canceling
    const station = await Station.findById(reqDoc.stationId);
    if (station) {
      const updateField = reqDoc.fuelType === "petrol" ? "petrolQty" : "dieselQty";
      const currentQty = station[updateField] || 0;
      const restoredQty = currentQty + reqDoc.amount;

      await Station.findByIdAndUpdate(reqDoc.stationId, {
        [updateField]: restoredQty,
        // Restore availability if quantity becomes positive
        [reqDoc.fuelType]: restoredQty > 0
      });
    }

    reqDoc.status = "CANCELED";
    await reqDoc.save();

    // Optionally populate station for response
    await reqDoc.populate("stationId");

    return NextResponse.json({ success: true, request: reqDoc });
  } catch (err) {
    console.error("Error canceling request", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}