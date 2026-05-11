import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";

export async function GET(req: NextRequest) {
  const tx_ref = req.nextUrl.searchParams.get("tx_ref");
  if (!tx_ref) return NextResponse.json({ error: "Missing tx_ref" }, { status: 400 });

  // Verify with Chapa
  const chapaRes = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
    headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
  });

  const chapaData = await chapaRes.json();
  if (!chapaRes.ok || chapaData.status !== "success") {
    console.error("Chapa wallet-verify failed:", chapaData);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  const txData = chapaData.data;
  const meta: { userId?: string; topUpAmount?: number; type?: string } = txData.meta ?? {};
  const paidAmount = parseFloat(txData.amount ?? "0");

  if (meta.type !== "WALLET_TOPUP" || !meta.userId) {
    return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 });
  }

  await connectDB();

  // Idempotency: check if already processed
  const existing = await WalletTransaction.findOne({
    txRef: tx_ref,
    type: "TOP_UP",
  });
  if (existing) {
    return NextResponse.json({ verified: true, tx_ref, alreadyProcessed: true });
  }

  try {
    let wallet = await Wallet.findOne({ userId: meta.userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId: meta.userId, balance: 0 });
    }

    // Credit wallet
    wallet.balance = (wallet.balance ?? 0) + paidAmount;
    await wallet.save();

    // Record transaction
    await WalletTransaction.create({
      walletId: wallet._id,
      type: "TOP_UP",
      amount: paidAmount,
      description: `Wallet top-up via Chapa`,
      txRef: tx_ref,
    });


    return NextResponse.json({ verified: true, tx_ref, newBalance: wallet.balance });
  } catch (err) {
    console.error("wallet-verify: failed to credit wallet:", err);
    return NextResponse.json({ error: "Failed to credit wallet" }, { status: 500 });
  }
}
