import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import FuelAlertSubscription from "@/models/FuelAlertSubscription";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== "DRIVER") {
    return NextResponse.json({ error: "Only drivers can view alerts" }, { status: 403 });
  }

  await connectDB();
  const subs = await FuelAlertSubscription.find({
    driverId: decoded.id,
    active: true,
  }).lean();

  return NextResponse.json(subs);
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== "DRIVER") {
    return NextResponse.json({ error: "Only drivers can subscribe" }, { status: 403 });
  }

  const body = await req.json();
  const { stationId, fuelType } = body as {
    stationId?: string;
    fuelType: "petrol" | "diesel";
  };

  if (!fuelType || !["petrol", "diesel"].includes(fuelType)) {
    return NextResponse.json(
      { error: "fuelType must be 'petrol' or 'diesel'" },
      { status: 400 }
    );
  }

  await connectDB();

  const sub = await FuelAlertSubscription.findOneAndUpdate(
    { driverId: decoded.id, stationId: stationId || null, fuelType },
    { active: true },
    { upsert: true, new: true }
  );

  return NextResponse.json(sub);
}

export async function DELETE(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== "DRIVER") {
    return NextResponse.json({ error: "Only drivers can unsubscribe" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const stationId = searchParams.get("stationId");
  const fuelType = searchParams.get("fuelType") as "petrol" | "diesel" | null;

  if (!fuelType || !["petrol", "diesel"].includes(fuelType)) {
    return NextResponse.json(
      { error: "fuelType must be 'petrol' or 'diesel'" },
      { status: 400 }
    );
  }

  await connectDB();

  await FuelAlertSubscription.findOneAndUpdate(
    { driverId: decoded.id, stationId: stationId || null, fuelType },
    { active: false }
  );

  return NextResponse.json({ ok: true });
}

