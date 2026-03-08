import { connectDB } from "@/lib/db";
import Station from "@/models/Station";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();

  const { name, location } = await req.json();

  const station = await Station.create({
    name,
    location,
  });

  return NextResponse.json(station);
}