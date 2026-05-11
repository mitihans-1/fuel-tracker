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
    if (!decoded || (decoded.role !== "ADMIN" && decoded.role !== "STATION")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const { 
      name, stationName, // Handle both name and stationName
      location, stationLocation, 
      zone, woreda, kebele, 
      email, password, 
      verificationDoc 
    } = body;

    const finalName = name || stationName;
    const finalLocation = location || stationLocation;

    if (decoded.role === "STATION" && !verificationDoc) {
      return NextResponse.json({ error: "Verification document is required for station registration." }, { status: 400 });
    }

    if (!finalName || !finalLocation) {
      return NextResponse.json({ error: "Required fields missing." }, { status: 400 });
    }

    await connectDB();
    
    let managerId = decoded.id;

    if (decoded.role === "ADMIN") {
      if (!email || !password) {
        return NextResponse.json({ error: "Email and password required for new manager account." }, { status: 400 });
      }
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
      }

      const bcrypt = (await import("bcryptjs")).default;
      const hashedPassword = await bcrypt.hash(password, 10);
      const stationManager = await UserModel.create({
        name: `${finalName} Manager`,
        email,
        password: hashedPassword,
        role: "STATION",
        isVerified: true,
      });
      managerId = stationManager._id;
    }

    // 2. Geocode location
    let lat: number | undefined;
    let lon: number | undefined;

    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(finalLocation)}&format=json&limit=1`,
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
    const newStation = await Station.create({
      name: finalName,
      location: finalLocation,
      zone,
      woreda,
      kebele,
      petrol: false,
      diesel: false,
      ownerUserId: managerId,
      latitude: lat,
      longitude: lon,
      isSetupComplete: true,
      verificationDoc,
      verificationStatus: decoded.role === "ADMIN" ? "APPROVED" : "PENDING"
    });

    return NextResponse.json({ 
      message: decoded.role === "ADMIN" ? "Station and manager account created" : "Station registered and awaiting approval",
      station: newStation
    }, { status: 201 });

    } catch (err) {
    console.error("STATION UPGRADE ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
