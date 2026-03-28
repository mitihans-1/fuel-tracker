import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Return id + role directly from the JWT — no DB round-trip needed.
  return NextResponse.json(
    { 
      _id: decoded.id, 
      id: decoded.id, 
      role: decoded.role,
      name: decoded.name,
      email: decoded.email
    },
    { headers: { "Cache-Control": "private, max-age=60" } }
  );
}
