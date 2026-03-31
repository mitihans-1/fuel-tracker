import { connectDB } from "@/lib/db";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  console.log("VERIFY API: Received request for token:", token?.substring(0, 10) + "...");

  if (!token) {
    console.log("VERIFY API: Missing token.");
    return NextResponse.json({ message: "Missing token" }, { status: 400 });
  }

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: new Date() },
  });

  if (!user) {
    console.log("VERIFY API: User not found for token or token expired.");
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
  }

  console.log("VERIFY API: Found user:", user.email);
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  
  try {
    await user.save();
    console.log("VERIFY API: User marked as verified successfully.");
  } catch (err) {
    console.error("VERIFY API: Error saving user:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }

  // Redirect to login page with success message
  console.log("VERIFY API: Redirecting to /auth/login?verified=true");
  return NextResponse.redirect(new URL("/auth/login?verified=true", req.url));
}
