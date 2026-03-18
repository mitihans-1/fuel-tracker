import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";

export async function GET() {
  try {
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

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId, balance: 0 });
    }

    const recentTx = await WalletTransaction.find({ walletId: wallet._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({
      balance: wallet.balance,
      currency: wallet.currency,
      recentTransactions: recentTx.map((t) => ({
        _id: t._id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        createdAt: t.createdAt,
      })),
    });
  } catch (err) {
    console.error("wallet/me error", err);
    return NextResponse.json(
      { error: "Failed to load wallet" },
      { status: 500 }
    );
  }
}

