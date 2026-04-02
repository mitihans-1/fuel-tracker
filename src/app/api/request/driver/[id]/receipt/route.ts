import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import FuelRequest from "@/models/FuelRequest";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const reqDoc = await FuelRequest.findById(id).populate("stationId", "name location");
    if (!reqDoc) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    if (String(reqDoc.driverId) !== String(user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const stationName =
      typeof reqDoc.stationId === "object" && reqDoc.stationId && "name" in reqDoc.stationId
        ? String(reqDoc.stationId.name)
        : "Unknown Station";
    const stationLocation =
      typeof reqDoc.stationId === "object" && reqDoc.stationId && "location" in reqDoc.stationId
        ? String(reqDoc.stationId.location ?? "N/A")
        : "N/A";

    const receipt = [
      "FuelSync Receipt",
      "================",
      `Request ID: ${reqDoc._id}`,
      `Date: ${new Date(reqDoc.createdAt).toISOString()}`,
      `Station: ${stationName}`,
      `Location: ${stationLocation}`,
      `Fuel Type: ${String(reqDoc.fuelType ?? "").toUpperCase()}`,
      `Quantity: ${reqDoc.amount ?? 0} L`,
      `Total: ${reqDoc.totalPrice ?? 0} ETB`,
      `Request Status: ${reqDoc.status}`,
      `Payment Status: ${reqDoc.paymentStatus}`,
      `Payout Status: ${reqDoc.payoutStatus ?? "N/A"}`,
      `Refund Status: ${reqDoc.refundStatus ?? "NONE"}`,
      "================",
      "Thank you for using FuelSync.",
      "",
    ].join("\n");

    return new NextResponse(receipt, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename=\"fuelsync-receipt-${reqDoc._id}.txt\"`,
      },
    });
  } catch (err) {
    console.error("driver receipt error", err);
    return NextResponse.json({ error: "Failed to generate receipt" }, { status: 500 });
  }
}
