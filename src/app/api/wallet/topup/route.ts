import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = token ? verifyToken(token) : null;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount } = await req.json();
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    await connectDB();
    const dbUser = await User.findById(user.id).lean() as { name?: string; email?: string } | null;

    const fullName = dbUser?.name ?? "Wallet User";
    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] ?? "Wallet";
    const lastName = nameParts.slice(1).join(" ") || "User";
    const email = dbUser?.email ?? `${user.id}@fuelsync.local`;

    const tx_ref = `fuelsync-wallet-${user.id}-${Date.now()}`;
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?wallet_payment=success&tx_ref=${tx_ref}`;

    const chapaBody = {
      amount: String(amount),
      currency: "ETB",
      email,
      first_name: firstName,
      last_name: lastName,
      tx_ref,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/chapa/wallet-verify`,
      return_url: returnUrl,
      customization: {
        title: "FuelSync Wallet Top-Up",
        description: `Add ${amount} ETB to your FuelSync wallet`,
      },
      meta: { userId: user.id, topUpAmount: amount, type: "WALLET_TOPUP" },
    };

    const res = await fetch("https://api.chapa.co/v1/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chapaBody),
    });

    const data = await res.json();
    if (!res.ok || data.status !== "success") {
      console.error("Chapa wallet top-up init failed:", data);
      return NextResponse.json({ error: data.message || "Chapa init failed" }, { status: 400 });
    }

    return NextResponse.json({ checkout_url: data.data.checkout_url, tx_ref });
  } catch (err) {
    console.error("wallet/topup error", err);
    return NextResponse.json({ error: "Failed to initialize top-up" }, { status: 500 });
  }
}
