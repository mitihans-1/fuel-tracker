import { connectDB } from "@/lib/db";
import UserModel from "@/models/user";
import Station from "@/models/Station";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can register stations" }, { status: 403 });
    }

    const body = await req.json();
    const { name, location, zone, woreda, kebele, email, password } = body;

    if (!name || !location || !email || !password) {
      return NextResponse.json({ error: "Required fields missing." }, { status: 400 });
    }

    await connectDB();
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1. Create the station manager user
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    const bcrypt = (await import("bcryptjs")).default;
    const hashedPassword = await bcrypt.hash(password, 10);
    const stationManager = await UserModel.create({
      name: `${name} Manager`,
      email,
      password: hashedPassword,
      role: "STATION",
      isVerified: true,
    });

    // 2. Geocode location
    let lat: number | undefined;
    let lon: number | undefined;

    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
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

    // 3. Create the station
    await Station.create({
      name,
      location,
      zone,
      woreda,
      kebele,
      petrol: false,
      diesel: false,
      ownerUserId: stationManager._id,
      latitude: lat,
      longitude: lon,
      isSetupComplete: true,
    });

    return NextResponse.json({ message: "Station and manager account created successfully" }, { status: 201 });

  } catch (err) {
    console.error("STATION UPGRADE ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
