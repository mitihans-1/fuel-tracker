import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email";

export async function GET() {
  try {
    // Replace with your own email to test
    const testEmail = process.env.EMAIL_SERVER_USER || "fueltracker1@gmail.com";
    await sendVerificationEmail(testEmail, "test-token-123");
    return NextResponse.json({ success: true, message: `Test email sent to ${testEmail}` });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
