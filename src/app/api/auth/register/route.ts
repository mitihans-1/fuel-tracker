import { connectDB } from "@/lib/db";
import UserModel from "@/models/User";
import Station from "@/models/Station";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  await connectDB();
  const { name, email, password, role, stationName, stationLocation } = await req.json();

  if (!name || !email || !password || !role) {
    return NextResponse.json({ message: "All fields are required" }, { status: 400 });
  }

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

  // SECURITY FIX: Only allow your email to become an admin during registration
  const finalRole = role;
  if (role === "ADMIN") {
    if (email !== "mitikumitihans@gmail.com") {
      return NextResponse.json({ message: "Unauthorized role assignment" }, { status: 403 });
    }
  }

  const user = await UserModel.create({
    name,
    email,
    password: hashedPassword,
    role: finalRole, // Use the verified role
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

  if (role === "STATION") {
    let lat: number | undefined;
    let lon: number | undefined;

    try {
      // Basic geocoding with Nominatim (OpenStreetMap)
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(stationLocation)}&format=json&limit=1`,
        { headers: { "User-Agent": "FuelTrackerApp/1.0" } }
      );
      const geoData = await geoRes.json();
      if (geoData && geoData.length > 0) {
        lat = parseFloat(geoData[0].lat);
        lon = parseFloat(geoData[0].lon);
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    }

    await Station.create({
      name: stationName || name || "Station",
      location: stationLocation || "Unknown",
      petrol: false,
      diesel: false,
      ownerUserId: user._id,
      latitude: lat,
      longitude: lon,
    });
  }

  return NextResponse.json({ 
    message: emailSent 
      ? "User registered successfully! Please check your email to verify." 
      : `User registered, but email failed: ${emailError}. Please check your SMTP settings or try again.`, 
    status: 201 
  });
}
