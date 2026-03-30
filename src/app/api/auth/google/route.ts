import { OAuth2Client } from "google-auth-library";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import { signToken } from "@/lib/auth";
import { NextResponse } from "next/server";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
  await connectDB();
  const { idToken } = await req.json();

  try {
    // 1. Verify the Google Token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) throw new Error("Invalid Google token");

    const { email, name } = payload;

    // 2. Find or Create the User in your DB
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if they don't exist
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(-10), // Random password for OAuth users
        role: "DRIVER", // Default role
        isVerified: true, // Google accounts are already verified
      });
    }

    // 3. Generate your App's JWT Token
    const token = signToken({ id: user._id, role: user.role });

    // 4. Set Cookie and Return Success
    const response = NextResponse.json({ success: true, role: user.role });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Google Login Error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }
}