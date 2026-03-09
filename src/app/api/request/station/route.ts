import { connectDB } from "@/lib/db";
import FuelRequest from "@/models/FuelRequest";
import { NextResponse } from "next/server";

export async function GET() {

  await connectDB();

  const requests = await FuelRequest.find()
  .populate("driverId")
  .populate("stationId");

  return NextResponse.json(requests);

}