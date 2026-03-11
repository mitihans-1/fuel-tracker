import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Station from "@/models/Station";

export async function GET(_req: NextRequest) {
  await connectDB();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = async () => {
        const stations = await Station.find({}).lean();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(stations)}\n\n`));
      };
      await send();
      const interval = setInterval(send, 5000);
      controller.enqueue(encoder.encode(": keep-alive\n\n"));
      return () => clearInterval(interval);
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
}