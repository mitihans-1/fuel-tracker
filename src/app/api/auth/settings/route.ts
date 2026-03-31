import { connectDB } from "@/lib/db";
import UserModel from "@/models/user";
import bcrypt from "bcryptjs";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

async function getAuthedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

// GET — return current user's name, email, role
export async function GET() {
  await connectDB();
  const decoded = await getAuthedUser();
  if (!decoded) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const user = await UserModel.findById(decoded.id).select("name email role");
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ name: user.name, email: user.email, role: user.role });
}

const profileSchema = z.object({
  action: z.literal("profile"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z.object({
  action: z.literal("password"),
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

// PUT — update profile or change password
export async function PUT(req: NextRequest) {
  await connectDB();
  const decoded = await getAuthedUser();
  if (!decoded) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const body = await req.json();

  // ── Profile update ──────────────────────────────────────────────────────────
  if (body.action === "profile") {
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
    }
    const { name, email } = parsed.data;

    const user = await UserModel.findById(decoded.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Check email uniqueness (allow keeping their own email)
    if (email !== user.email) {
      const taken = await UserModel.findOne({ email });
      if (taken) {
        return NextResponse.json({ message: "That email address is already in use." }, { status: 400 });
      }
    }

    user.name = name;
    user.email = email;
    await user.save();

    return NextResponse.json({ message: "Profile updated successfully." });
  }

  // ── Password change ─────────────────────────────────────────────────────────
  if (body.action === "password") {
    const parsed = passwordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
    }
    const { currentPassword, newPassword } = parsed.data;

    // Strength check
    const isStrong =
      newPassword.length >= 8 &&
      /[A-Z]/.test(newPassword) &&
      /[a-z]/.test(newPassword) &&
      /[0-9]/.test(newPassword) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!isStrong) {
      return NextResponse.json(
        { message: "Password must be 8+ characters with uppercase, lowercase, number, and symbol." },
        { status: 400 }
      );
    }

    const user = await UserModel.findById(decoded.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (!user.password) {
      return NextResponse.json(
        { message: "This account uses social login and has no password to change." },
        { status: 400 }
      );
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return NextResponse.json({ message: "Current password is incorrect." }, { status: 400 });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return NextResponse.json({ message: "Password changed successfully." });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
