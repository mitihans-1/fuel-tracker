import { connectDB } from "@/lib/db";
import FuelRequest from "@/models/FuelRequest";
import Station from "@/models/Station";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {

  await connectDB();

  const { requestId, status } = await req.json();

  // Get the current request before updating
  const currentRequest = await FuelRequest.findById(requestId);
  if (!currentRequest) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  // Decrement stock only when the request is marked COMPLETED (served).
  // This makes station inventory and queue reflect real-world fulfillment.
  if (status === "COMPLETED" && currentRequest.status !== "COMPLETED") {
    const station = await Station.findById(currentRequest.stationId);
    if (station) {
      const updateField =
        currentRequest.fuelType === "petrol" ? "petrolQty" : "dieselQty";
      const currentQty = (station as any)[updateField] || 0;
      const newQty = Math.max(0, currentQty - (currentRequest.amount || 0));

      await Station.findByIdAndUpdate(currentRequest.stationId, {
        [updateField]: newQty,
        [currentRequest.fuelType]: newQty > 0,
      });
    }
  }

  const request = await FuelRequest.findByIdAndUpdate(
    requestId,
    { status },
    { new: true }
  );

  return NextResponse.json(request);

}