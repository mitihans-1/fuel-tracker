import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    console.log("ME API: No token found in cookies.");
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    console.log("ME API: Invalid or expired token.", token.substring(0, 20) + "...");
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  await connectDB();

  try {
    const dbUser = await User.findById(decoded.id).lean();
    if (!dbUser) {
      console.log("ME API: User not found in database for ID:", decoded.id);
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    return NextResponse.json({
      _id: dbUser._id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
    });
  } catch (err) {
    console.error("ME API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}