import { connectDB } from "@/lib/db";
import UserModel from "@/models/user";
import Station from "@/models/Station";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { stationName, stationLocation } = body;

    if (!stationName || !stationLocation) {
      return NextResponse.json({ error: "Station name and location are required." }, { status: 400 });
    }

    await connectDB();
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Geocode location
    let lat: number | undefined;
    let lon: number | undefined;

    try {
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

    // Create the station
    await Station.create({
      name: stationName,
      location: stationLocation,
      petrol: false,
      diesel: false,
      ownerUserId: user._id,
      latitude: lat,
      longitude: lon,
    });

    // Upgrade the user's role
    user.role = "STATION";
    await user.save();

    // Issue a new token with the updated role
    const newToken = signToken({ id: user._id, role: "STATION" });
    
    const response = NextResponse.json({ message: "Station registered successfully", updatedRole: "STATION" }, { status: 200 });
    
    response.cookies.set({
        name: "token",
        value: newToken,
        httpOnly: true,
        path: "/",
        maxAge: 86400, // 1 day
    });

    return response;

  } catch (err) {
    console.error("STATION UPGRADE ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
