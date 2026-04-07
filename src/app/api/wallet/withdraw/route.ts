import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";

export async function POST(req: Request) {
  try {
    const { amount, accountDetails } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid withdrawal amount" }, { status: 400 });
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

    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // Deduct balance
    wallet.balance -= amount;
    await wallet.save();

    // Record withdrawal transaction
    await WalletTransaction.create({
      walletId: wallet._id,
      type: "DEBIT",
      amount: amount,
      description: `Withdrawal request for ${amount} ETB to: ${accountDetails || "Not specified"}`,
    });

    return NextResponse.json({ 
      success: true, 
      newBalance: wallet.balance,
      message: "Withdrawal processed successfully" 
    });
  } catch (err) {
    console.error("wallet/withdraw error", err);
    return NextResponse.json(
      { error: "Failed to process withdrawal" },
      { status: 500 }
    );
  }
}
