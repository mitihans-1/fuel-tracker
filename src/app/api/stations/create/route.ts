import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import FuelRequest from "@/models/FuelRequest";
import Station from "@/models/Station";

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

    // 2. Automatically decrement the station's quantity in the database
    const updateField = fuelType === "petrol" ? "petrolQty" : "dieselQty";
    const station = await Station.findById(stationId);
    
    if (station) {
      const currentQty = station[updateField] || 0;
      const newQty = Math.max(0, currentQty - amount);
      
      await Station.findByIdAndUpdate(stationId, {
        [updateField]: newQty,
        // If stock hits 0, set availability to false automatically
        [fuelType]: newQty > 0
      });
    }

    return NextResponse.json(newRequest, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
