import { connectDB } from "@/lib/db";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      console.log("LOGIN API: Validation failed", parsed.error.issues[0].message);
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

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
    response.cookies.set("token",token,{
      httpOnly: true,
      secure:process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
      sameSite: "lax",
    });

    console.log("LOGIN API: Login successful, cookie set for user:", user.email);
    return response;
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}