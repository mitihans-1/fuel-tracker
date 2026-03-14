import { connectDB } from "@/lib/db";
import UserModel from "@/models/user";
import Station from "@/models/Station";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connectDB();
  const { name, email, password, role, stationName, stationLocation } = await req.json();

  if (!name || !email || !password || !role) {
    return NextResponse.json({ message: "All fields are required" }, { status: 400 });
  }

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ message: "Email already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await UserModel.create({
    name,
    email,
    password: hashedPassword,
    role, // "DRIVER", "STATION", "ADMIN"
  });

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

  return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
}
