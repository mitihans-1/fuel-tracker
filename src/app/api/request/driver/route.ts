import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Request from "@/models/FuelRequest";

/**
 * DELETE /api/request/driver/:id
 * Cancels a pending request owned by the authenticated driver.
 */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await connectDB();

  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { id } = params;
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