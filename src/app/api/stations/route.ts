import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Station from "@/models/station";

export async function GET() {
  try {
    await connectDB();
    const stations = await Station.find({});
    return NextResponse.json(stations);
  } catch {
    return NextResponse.json({ error: "Failed to fetch stations" }, { status: 500 });
  }
}
