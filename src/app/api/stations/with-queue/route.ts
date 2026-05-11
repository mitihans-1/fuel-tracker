import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Station from "@/models/Station";
import FuelRequest from "@/models/FuelRequest";

export async function GET() {
  try {
    await connectDB();

    const [stations, waitingRequests] = await Promise.all([
      Station.find({ 
        $or: [
          { verificationStatus: "APPROVED" },
          { verificationStatus: { $exists: false } }
        ]
      }).lean(),
      FuelRequest.find({ status: { $in: ["PENDING", "APPROVED"] } })
        .select("stationId createdAt status")
        .lean(),
    ]);

    const queueMap = new Map<
      string,
      { count: number; oldestCreatedAt?: Date }
    >();

    for (const r of waitingRequests) {
      const sid = r.stationId?.toString();
      if (!sid) continue;
      const existing = queueMap.get(sid) || { count: 0, oldestCreatedAt: undefined };
      existing.count += 1;
      if (!existing.oldestCreatedAt || (r.createdAt && r.createdAt < existing.oldestCreatedAt)) {
        existing.oldestCreatedAt = r.createdAt as Date | undefined;
      }
      queueMap.set(sid, existing);
    }

    const AVG_SERVICE_MIN_PER_VEHICLE = 5;
    const now = Date.now();

    const enriched = stations.map((s: any) => {
      const q = queueMap.get(s._id.toString()) || { count: 0, oldestCreatedAt: undefined };
      let estimatedWaitMinutes = q.count * AVG_SERVICE_MIN_PER_VEHICLE;
      if (q.oldestCreatedAt) {
        const waitedMs = now - new Date(q.oldestCreatedAt).getTime();
        const waitedMin = Math.max(0, Math.round(waitedMs / 60000));
        estimatedWaitMinutes = Math.max(0, estimatedWaitMinutes - waitedMin);
      }

      return {
        ...s,
        queueLength: q.count,
        estimatedWaitMinutes,
      };
    });

    return NextResponse.json(enriched);
  } catch (err) {
    console.error("with-queue error", err);
    return NextResponse.json(
      { error: "Failed to fetch station queues" },
      { status: 500 }
    );
  }
}

