import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Station from "@/models/Station";

export async function GET(req: NextRequest) {
  await connectDB();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let closed = false;
      let interval: ReturnType<typeof setInterval> | null = null;

      const cleanup = () => {
        if (interval) clearInterval(interval);
        if (!closed) {
          try { controller.close(); } catch {}
          closed = true;
        }
      };

      const send = async () => {
        if (closed) return;
        try {
          const stations = await Station.find({}).lean();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(stations)}\n\n`));
        } catch {
          cleanup();
        }
      };

      // Initial payload + keep-alive intervals
      await send();
      interval = setInterval(send, 5000);
      try { controller.enqueue(encoder.encode(": keep-alive\n\n")); } catch {}

      // Abort on client disconnect
      req.signal.addEventListener("abort", cleanup, { once: true });
    },
    cancel() {
      // Called when the consumer cancels the stream
      // Cleanup handled in start via closure (interval cleared on abort)
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