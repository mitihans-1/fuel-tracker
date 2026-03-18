import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import FuelRequest from "@/models/FuelRequest";

export async function POST(req: NextRequest) {
  await connectDB();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const user = verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const { stationId, fuelType, amount, totalPrice } = await req.json();

    // 1. Create the fuel request
    const newRequest = await FuelRequest.create({
      driverId: user.id,
      stationId,
      fuelType,
      amount,
      totalPrice,
      paymentStatus: "PENDING",
      status: "PENDING"
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
