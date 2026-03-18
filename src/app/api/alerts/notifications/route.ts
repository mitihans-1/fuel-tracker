import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== "DRIVER") {
    return NextResponse.json(
      { error: "Only drivers can view notifications" },
      { status: 403 }
    );
  }

  await connectDB();
  const notifications = await Notification.find({ userId: decoded.id })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return NextResponse.json(notifications);
}

export async function PATCH(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== "DRIVER") {
    return NextResponse.json(
      { error: "Only drivers can update notifications" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { markAllRead } = body as { markAllRead?: boolean };

  await connectDB();

  if (markAllRead) {
    await Notification.updateMany(
      { userId: decoded.id, read: false },
      { read: true }
    );
  }

  return NextResponse.json({ ok: true });
}

