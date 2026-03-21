import { connectDB } from "@/lib/db";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      console.log("LOGIN API: Missing email or password");
      return NextResponse.json(
        { message: "Email and password required" },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      console.log("LOGIN API: User not found:", email);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("LOGIN API: Invalid password for", email);
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if user is verified
    if (!user.isVerified) {
      console.log("LOGIN API: User not verified:", email);
      return NextResponse.json(
        { message: "Please verify your email address before signing in." },
        { status: 403 }
      );
    }

    // Sign JWT token with user id + role using shared helper
    const token = signToken({
      id: user._id,
      role: user.role
    });

    // Return response with HTTP-only cookie
    const response = NextResponse.json({
      message: "Login successful",
      role: user.role,
    });

    // Use a more robust cookie configuration for local development
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: false, // Must be false for http://localhost
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
      sameSite: "lax", // Good for cross-origin navigation but same-site cookie
    });

    console.log("LOGIN API: Login successful, cookie set for user:", user.email);
    return response;
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}