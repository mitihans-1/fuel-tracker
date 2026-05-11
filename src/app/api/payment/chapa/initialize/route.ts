import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/user";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount, fuelType, stationId, stationName, litres } = await req.json();

  if (!amount || !fuelType || !stationId || !litres) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Chapa requires email and name — fetch from DB (payment init is a rare operation)
  await connectDB();
  const dbUser = await User.findById(user.id).lean() as { name?: string; email?: string } | null;

  const fullName = dbUser?.name ?? "Driver User";
  const nameParts = fullName.trim().split(" ");
  const firstName = nameParts[0] ?? "Driver";
  const lastName = nameParts.slice(1).join(" ") || "User";
  const email = dbUser?.email ?? `${user.id}@fuelsync.local`;

  const tx_ref = `fuelsync-${user.id}-${Date.now()}`;
  const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success&tx_ref=${tx_ref}`;

  const chapaBody = {
    amount: String(amount),
    currency: "ETB",
    email,
    first_name: firstName,
    last_name: lastName,
    tx_ref,
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/chapa/webhook`,
    return_url: returnUrl,
    customization: {
      title: "FuelSync Payment",
      description: `${litres}L of ${fuelType} at ${stationName}`,
    },
    meta: { stationId, fuelType, litres, userId: user.id, stationName },
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
    console.error("Chapa init failed:", data);
    return NextResponse.json({ error: data.message || "Chapa init failed" }, { status: 400 });
  }

  return NextResponse.json({ checkout_url: data.data.checkout_url, tx_ref });
}
