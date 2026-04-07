import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/user";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      console.log("ME API: Token verification failed");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();
    const dbUser = await User.findById(decoded.id).select("name email role").lean() as
      | { _id: { toString(): string }; name?: string; email?: string; role?: string }
      | null;

    if (!dbUser) {
      console.log("ME API: User not found in DB for ID:", decoded.id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { 
        _id: dbUser._id.toString(),
        id: dbUser._id.toString(),
        role: dbUser.role ?? decoded.role,
        name: dbUser.name ?? decoded.name,
        email: dbUser.email ?? decoded.email
      },
      { headers: { "Cache-Control": "private, max-age=60" } }
    );
  } catch (err) {
    console.error("ME API ERROR:", err);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: err instanceof Error ? err.message : "Unknown error" 
    }, { status: 500 });
  }
}