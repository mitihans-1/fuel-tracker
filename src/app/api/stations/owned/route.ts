import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Station from "@/models/Station";

export async function GET() {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = token ? verifyToken(token) : null;
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await Station.countDocuments({ ownerUserId: user.id });
    return NextResponse.json({ hasOwnedStation: count > 0, count });
  } catch (err) {
    console.error("stations/owned error", err);
    return NextResponse.json({ error: "Failed to check station ownership" }, { status: 500 });
  }
}
