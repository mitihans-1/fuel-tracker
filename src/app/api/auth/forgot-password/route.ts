import { connectDB } from "@/lib/db";
import UserModel from "@/models/User";
import { sendPasswordResetEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Always return the same response to prevent email enumeration
    const genericResponse = NextResponse.json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });

    const user = await UserModel.findOne({ email });

    if (!user) {
      console.log("FORGOT-PASSWORD API: No user found for email:", email);
      return genericResponse;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetTokenExpires = resetTokenExpires;
    await user.save();

    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (err) {
      console.error("FORGOT-PASSWORD API: Email send failed:", err);
      // Still return generic response — don't reveal failure
    }

    console.log("FORGOT-PASSWORD API: Reset email dispatched for:", email);
    return genericResponse;
  } catch (err) {
    console.error("FORGOT-PASSWORD ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
