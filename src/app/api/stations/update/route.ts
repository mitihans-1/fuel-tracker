import { connectDB } from "@/lib/db";
import Station from "@/models/Station";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {

  await connectDB();

  const { id, petrol, diesel } = await req.json();

  const station = await Station.findByIdAndUpdate(
    id,
    {
      petrol,
      diesel,
      updatedAt: new Date(),
    },
    { new: true }
  );

  return NextResponse.json(station);
}