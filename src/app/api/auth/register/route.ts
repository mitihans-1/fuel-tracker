import { connectDB } from "@/lib/db";
import UserModel from "@/models/user";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";
import { z } from "zod";

// Zod schema for registration validation
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    
    // Zod validation logic (assuming registerSchema is imported)
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    // Server-side password strength check
    const isStrong = 
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!isStrong) {
      return NextResponse.json({ 
        message: "Password is not strong enough. Use 8+ characters with uppercase, lowercase, numbers, and symbols." 
      }, { status: 400 });
    }

    const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ message: "Email already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // AUTOMATIC BOOTSTRAP: Only a specific 'seed' email becomes admin.
  // Everyone else defaults to DRIVER.
  const finalRole = email === "mitikumitihans@gmail.com" ? "ADMIN" : "DRIVER";

  const user = await UserModel.create({
    name,
    email,
    password: hashedPassword,
    role: finalRole,
    isVerified: false,
    verificationToken,
    verificationTokenExpires,
  });

  let emailSent = false;
  let emailError = "";
  try {
    await sendVerificationEmail(email, verificationToken);
    emailSent = true;
  } catch (err: unknown) {
    console.error("Email sending failed, but user was created:", err);
    emailError = err instanceof Error ? err.message : "Unknown SMTP error";
  }


    return NextResponse.json({ 
      message: emailSent 
        ? "User registered successfully! Please check your email to verify." 
        : `User registered, but email failed: ${emailError}. Please check your SMTP settings or try again.`, 
      status: 201 
    });
  } catch (err) {
    console.error("REGISTRATION ERROR:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
