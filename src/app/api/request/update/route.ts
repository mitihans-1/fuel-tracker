import { connectDB } from "@/lib/db";
import FuelRequest from "@/models/FuelRequest";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {

  await connectDB();

  const { requestId, status } = await req.json();

  const request = await FuelRequest.findByIdAndUpdate(
    requestId,
    { status },
    { new: true }
  );

  return NextResponse.json(request);

}