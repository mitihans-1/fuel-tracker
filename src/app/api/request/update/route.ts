import { connectDB } from "@/lib/db";
import FuelRequest from "@/models/FuelRequest";
import Station from "@/models/Station";
import { NextResponse } from "next/server";
import { z } from "zod";

interface IStation {
  petrol: boolean;
  petrolQty: number;
  diesel: boolean;
  dieselQty: number;
  [key: string]: string | number | boolean | undefined;
}

const updateSchema = z.object({
  requestId: z.string().min(1),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "COMPLETED", "CANCELED"]),
});

export async function PUT(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const { requestId, status } = parsed.data;

    // Get the current request before updating
    const currentRequest = await FuelRequest.findById(requestId);
    if (!currentRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Decrement stock only when the request is marked COMPLETED (served).
    // This makes station inventory and queue reflect real-world fulfillment.
    if (status === "COMPLETED" && currentRequest.status !== "COMPLETED") {
      const station = await Station.findById(currentRequest.stationId) as IStation | null;
      if (station) {
        const updateField =
          currentRequest.fuelType === "petrol" ? "petrolQty" : "dieselQty";
        const currentQty = station[updateField] || 0;
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
  } catch (error) {
    console.error("Error updating request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}