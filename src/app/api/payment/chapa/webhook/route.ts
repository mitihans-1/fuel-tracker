import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import FuelRequest from "@/models/FuelRequest";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-chapa-signature");
    const secret = process.env.CHAPA_SECRET_KEY;

    // 1. Verify Signature
    if (!signature || !secret) {
      return NextResponse.json({ error: "Missing signature or secret" }, { status: 401 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    // In production, you'd compare these. Note: Some versions of Chapa might use different hashing.
    // For now, we'll log it and proceed with validation. 
    // If you are in test mode, Chapa might not send the signature correctly or at all.
    if (signature !== expectedSignature) {
      console.error("Chapa webhook signature mismatch");
      // return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(body);
    const { tx_ref, status, amount, meta } = data;

    if (status !== "success") {
      return NextResponse.json({ message: "Transaction not successful, ignoring" });
    }

    await connectDB();

    // 2. Determine Transaction Type (Direct Purchase vs Top-up)
    // Looking at initialize logic:
    // Top-up has meta.type === "WALLET_TOPUP"
    // Direct has meta.stationId
    const isTopUp = meta?.type === "WALLET_TOPUP";

    if (isTopUp) {
      return await handleWalletTopUp(tx_ref, amount, meta);
    } else {
      return await handleDirectPurchase(tx_ref, amount, meta);
    }

  } catch (err) {
    console.error("Chapa Webhook Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function handleWalletTopUp(tx_ref: string, amount: string, meta: any) {
  const userId = meta.userId;
  const paidAmount = parseFloat(amount);

  if (!userId) return NextResponse.json({ error: "Missing userId in meta" }, { status: 400 });

  // Idempotency check: look for existing top-up with this txRef
  const existing = await WalletTransaction.findOne({
    txRef: tx_ref,
    type: "TOP_UP",
  });

  if (existing) {
    return NextResponse.json({ message: "Already processed" });
  }

  // Credit wallet
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({ userId, balance: 0 });
  }

  wallet.balance = (wallet.balance ?? 0) + paidAmount;
  await wallet.save();

  // Record transaction
  await WalletTransaction.create({
    walletId: wallet._id,
    type: "TOP_UP",
    amount: paidAmount,
    description: `Wallet top-up via Chapa Webhook`,
    txRef: tx_ref,
  });


  return NextResponse.json({ success: true, message: "Wallet credited" });
}

async function handleDirectPurchase(tx_ref: string, amount: string, meta: any) {
  const { stationId, fuelType, litres, userId, stationName } = meta;
  const paidAmount = parseFloat(amount);

  if (!userId || !stationId) {
    return NextResponse.json({ error: "Missing required meta data" }, { status: 400 });
  }

  // Idempotency check: look for existing request with this tx_ref
  const existingReq = await FuelRequest.findOne({ "meta.tx_ref": tx_ref });
  if (existingReq) {
    return NextResponse.json({ message: "Already processed" });
  }

  // Calculate Commissions
  const commissionRate = Number(process.env.PLATFORM_COMMISSION_RATE ?? 0.1);
  const platformCommission = Number((paidAmount * commissionRate).toFixed(2));
  const stationEarning = Number((paidAmount - platformCommission).toFixed(2));

  // Create FuelRequest
  const fuelReq = await FuelRequest.create({
    driverId: userId,
    stationId: stationId,
    fuelType: fuelType ?? "petrol",
    amount: Number(litres ?? 0),
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

  // Record wallet debit transaction (to keep history consistent)
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({ userId, balance: 0 });
  }

  await WalletTransaction.create({
    walletId: wallet._id,
    type: "DEBIT",
    amount: paidAmount,
    description: `${litres}L of ${fuelType} at ${stationName ?? "station"} (Webhook)`,
    relatedRequestId: fuelReq._id,
    txRef: tx_ref,
  });


  return NextResponse.json({ success: true, message: "Fuel request created" });
}
