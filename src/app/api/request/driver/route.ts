import { connectDB } from "@/lib/db";
import FuelRequest from "@/models/FuelRequest";
import { NextResponse } from "next/server";

export async function GET(req: Request) {

  await connectDB();

  const { searchParams } = new URL(req.url);
  const driverId = searchParams.get("driverId");

  const requests = await FuelRequest.find({ driverId })
  .populate("stationId");

  return NextResponse.json(requests);

}