import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Station from "@/models/Station";
import User from "@/models/user";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const decoded = token ? verifyToken(token) : null;
  if (!decoded || decoded.role !== "ADMIN") return null;
  return decoded;
}

export async function GET() {
  try {
    await connectDB();
    const stations = await Station.find({}).sort({ name: 1 });
    return NextResponse.json(stations);
  } catch {
    return NextResponse.json({ error: "Failed to fetch stations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    await connectDB();
    const { name, location, zone, woreda, kebele, email, password } = await req.json();

    if (!name || !location || !email || !password) {
      return NextResponse.json({ error: "Name, location, email and password are required" }, { status: 400 });
    }

    // 1. Create the station manager user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const stationManager = await User.create({
      name: `${name} Manager`,
      email,
      password: hashedPassword,
      role: "STATION",
      isVerified: true,
    });

    // 2. Geocode the location
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
    const station = await Station.create({
      name,
      location,
      zone,
      woreda,
      kebele,
      ownerUserId: stationManager._id,
      latitude: lat,
      longitude: lon,
      petrol: false,
      petrolQty: 0,
      petrolPrice: 80,
      diesel: false,
      dieselQty: 0,
      dieselPrice: 75,
      isSetupComplete: true,
    });

    return NextResponse.json({ station, user: { email, role: "STATION" } }, { status: 201 });
  } catch (err) {
    console.error("admin/stations POST error", err);
    return NextResponse.json({ error: "Failed to create station" }, { status: 500 });
  }
}