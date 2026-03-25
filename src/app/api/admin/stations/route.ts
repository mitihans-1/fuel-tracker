import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Station from "@/models/Station";
import User from "@/models/User";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

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
    const { name, location, ownerEmail } = await req.json();

    if (!name || !location) {
      return NextResponse.json({ error: "Name and location are required" }, { status: 400 });
    }

    // Find the STATION-role user to assign as owner (optional)
    let ownerUserId: string | undefined;
    if (ownerEmail) {
      const ownerUser = await User.findOne({ email: ownerEmail, role: "STATION" }).lean() as { _id: { toString(): string } } | null;
      if (!ownerUser) {
        return NextResponse.json(
          { error: "No STATION-role user found with that email" },
          { status: 404 }
        );
      }
      ownerUserId = ownerUser._id.toString();
    }

    // Geocode the location
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

    const station = await Station.create({
      name,
      location,
      ownerUserId,
      latitude: lat,
      longitude: lon,
      petrol: false,
      petrolQty: 0,
      petrolPrice: 80,
      diesel: false,
      dieselQty: 0,
      dieselPrice: 75,
      isSetupComplete: !!ownerUserId, // Setup complete if owner assigned
    });

    return NextResponse.json(station, { status: 201 });
  } catch (err) {
    console.error("admin/stations POST error", err);
    return NextResponse.json({ error: "Failed to create station" }, { status: 500 });
  }
}
