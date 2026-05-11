import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import FuelRequest from "@/models/FuelRequest";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";

export async function GET(req: NextRequest) {
  const tx_ref = req.nextUrl.searchParams.get("tx_ref");
  if (!tx_ref) return NextResponse.json({ error: "Missing tx_ref" }, { status: 400 });

  // 1. Verify with Chapa
  const chapaRes = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
    headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
  });

  const chapaData = await chapaRes.json();
  if (!chapaRes.ok || chapaData.status !== "success") {
    console.error("Chapa verify failed:", chapaData);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  const txData = chapaData.data;
  const meta: { stationId?: string; fuelType?: string; litres?: number; userId?: string; stationName?: string } =
    txData.meta ?? {};
  const paidAmount = parseFloat(txData.amount ?? "0");
  const commissionRate = Number(process.env.PLATFORM_COMMISSION_RATE ?? 0.1);
  const platformCommission = Number((paidAmount * commissionRate).toFixed(2));
  const stationEarning = Number((paidAmount - platformCommission).toFixed(2));

  // 2. Idempotency: skip if already recorded for this tx_ref
  await connectDB();

  // 3. Create FuelRequest (PENDING status — station still fulfils; paymentStatus = PAID)
  try {
    const existingReq = await FuelRequest.findOne({ "meta.tx_ref": tx_ref });
    if (!existingReq && meta.userId && meta.stationId) {
      const fuelReq = await FuelRequest.create({
        driverId: meta.userId,
        stationId: meta.stationId,
        fuelType: meta.fuelType ?? "petrol",
        amount: Number(meta.litres ?? 0),
        totalPrice: paidAmount,
        stationEarning,
        platformCommission,
        commissionRate,
        payoutStatus: "PENDING",
        paymentStatus: "PAID",
        status: "PENDING",
        meta: {
          tx_ref,
          paymentProvider: "CHAPA",
        },
      });

      // 4. Record wallet debit transaction
      let wallet = await Wallet.findOne({ userId: meta.userId });
      if (!wallet) {
        wallet = await Wallet.create({ userId: meta.userId, balance: 0 });
      }
      await WalletTransaction.create({
        walletId: wallet._id,
        type: "DEBIT",
        amount: paidAmount,
        description: `${meta.litres}L of ${meta.fuelType} at ${meta.stationName ?? "station"}`,
        relatedRequestId: fuelReq._id,
        txRef: tx_ref,
      });

    }
  } catch (err) {
    console.error("Verify: failed to record payment:", err);
    // Don't fail the response — payment was verified, recording is best-effort
  }

  return NextResponse.json({ verified: true, tx_ref });
}
