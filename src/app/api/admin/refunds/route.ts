import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import FuelRequest from "@/models/FuelRequest";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const decoded = token ? verifyToken(token) : null;
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { requestId } = await req.json();
    if (!requestId) {
      return NextResponse.json({ error: "requestId is required" }, { status: 400 });
    }

    await connectDB();
    const requestDoc = await FuelRequest.findById(requestId);
    if (!requestDoc) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (requestDoc.paymentStatus !== "PAID") {
      return NextResponse.json({ error: "Only paid requests can be refunded" }, { status: 400 });
    }
    if (requestDoc.refundStatus === "PROCESSED") {
      return NextResponse.json({ error: "Refund already processed" }, { status: 400 });
    }

    const refundAmount = Number(requestDoc.totalPrice ?? 0);
    const stationReversal = Number(requestDoc.stationEarning ?? 0);
    const commissionReversal = Number(requestDoc.platformCommission ?? 0);

    let wallet = await Wallet.findOne({ userId: requestDoc.driverId });
    if (!wallet) {
      wallet = await Wallet.create({ userId: requestDoc.driverId, balance: 0 });
    }
    wallet.balance = (wallet.balance ?? 0) + refundAmount;
    await wallet.save();

    await WalletTransaction.create({
      walletId: wallet._id,
      type: "REFUND",
      amount: refundAmount,
      description: `Refund for request ${requestDoc._id}`,
      relatedRequestId: requestDoc._id,
    });

    requestDoc.paymentStatus = "REFUNDED";
    requestDoc.refundStatus = "PROCESSED";
    requestDoc.refundAt = new Date();
    requestDoc.refundAmount = refundAmount;
    requestDoc.stationReversal = stationReversal;
    requestDoc.commissionReversal = commissionReversal;
    await requestDoc.save();

    await createAuditLog({
      actorUserId: decoded.id,
      actorRole: "ADMIN",
      action: "REQUEST_REFUNDED",
      targetType: "FuelRequest",
      targetId: String(requestDoc._id),
      metadata: {
        refundAmount,
        stationReversal,
        commissionReversal,
        driverId: String(requestDoc.driverId),
      },
    });

    return NextResponse.json({
      success: true,
      requestId: requestDoc._id,
      refundAmount,
      stationReversal,
      commissionReversal,
    });
  } catch (err) {
    console.error("admin/refunds POST error", err);
    return NextResponse.json({ error: "Failed to process refund" }, { status: 500 });
  }
}
