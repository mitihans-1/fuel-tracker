import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import FuelRequest from "@/models/FuelRequest";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { amount, fuelType, stationId, stationName, litres } = await req.json();

    if (!amount || !fuelType || !stationId || !litres) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = user.id;

    // 1. Check Wallet Balance
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < amount) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
    }

    // 2. Calculate Commissions (mirroring Chapa verify logic)
    const commissionRate = Number(process.env.PLATFORM_COMMISSION_RATE ?? 0.1);
    const platformCommission = Number((amount * commissionRate).toFixed(2));
    const stationEarning = Number((amount - platformCommission).toFixed(2));

    const tx_ref = `wallet-pay-${userId}-${Date.now()}`;
    const qrToken = crypto.randomBytes(32).toString("hex");

    // 3. Create Fuel Request
    const fuelReq = await FuelRequest.create({
      driverId: userId,
      stationId,
      fuelType,
      amount: litres,
      totalPrice: amount,
      stationEarning,
      platformCommission,
      commissionRate,
      payoutStatus: "PENDING",
      paymentStatus: "PAID",
      status: "PENDING",
      qrToken,
      meta: {
        tx_ref,
        paymentProvider: "WALLET",
      },
    });

    // 4. Deduct Wallet Balance & Record Transaction
    wallet.balance -= amount;
    await wallet.save();

    await WalletTransaction.create({
      walletId: wallet._id,
      type: "DEBIT",
      amount: amount,
      description: `Payment for ${litres}L of ${fuelType} at ${stationName}`,
      relatedRequestId: fuelReq._id,
    });

    return NextResponse.json({ 
      success: true, 
      request: fuelReq,
      newBalance: wallet.balance 
    });

  } catch (err) {
    console.error("payment/wallet error", err);
    return NextResponse.json(
      { error: "Failed to process wallet payment" },
      { status: 500 }
    );
  }
}
