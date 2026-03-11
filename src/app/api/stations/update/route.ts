import { connectDB } from "@/lib/db";
import Station from "@/models/Station";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function PUT(req: Request) {
  await connectDB();

  const cookieStore = cookies();
  const token =  (await cookieStore).get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  const user = verifyToken(token);
  if (!user || user.role !== "STATION") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id, petrol, diesel, name, location } = await req.json();

  let station;
  if (id) {
    station = await Station.findByIdAndUpdate(
      id,
      { petrol, diesel, updatedAt: new Date() },
      { new: true }
    );
  } else {
    station = await Station.findOneAndUpdate(
      { ownerUserId: user.id },
      { petrol, diesel, updatedAt: new Date() },
      { new: true }
    );
    if (!station) {
      station = await Station.create({
        name: name || "Station",
        location: location || "Unknown",
        petrol: !!petrol,
        diesel: !!diesel,
        ownerUserId: user.id,
        updatedAt: new Date(),
      });
    }
  }

  return NextResponse.json(station);
}