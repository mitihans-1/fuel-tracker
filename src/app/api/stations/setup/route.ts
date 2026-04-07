import { connectDB } from "@/lib/db";
import Station from "@/models/Station";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const setupSchema = z.object({
  name: z.string().min(2, "Station name must be at least 2 characters"),
  location: z.string().min(2, "Location is required"),
  petrol: z.boolean(),
  petrolQty: z.number().min(0),
  petrolPrice: z.number().min(0),
  diesel: z.boolean(),
  dieselQty: z.number().min(0),
  dieselPrice: z.number().min(0),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = setupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, location, petrol, petrolQty, petrolPrice, diesel, dieselQty, dieselPrice } =
      parsed.data;

    // Geocode the location
    let lat: number | undefined;
    let lon: number | undefined;
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
        { headers: { "User-Agent": "FuelTrackerApp/1.0" } }
      );
      const geoData = await geoRes.json();
      if (geoData?.length > 0) {
        lat = parseFloat(geoData[0].lat);
        lon = parseFloat(geoData[0].lon);
      }
    } catch (err) {
      console.error("SETUP: Geocoding failed:", err);
    }

    const station = await Station.findOne({ ownerUserId: user.id });

    if (station) {
      station.name = name;
      station.location = location;
      station.petrol = petrol;
      station.petrolQty = petrolQty;
      station.petrolPrice = petrolPrice;
      station.diesel = diesel;
      station.dieselQty = dieselQty;
      station.dieselPrice = dieselPrice;
      station.isSetupComplete = true;
      if (lat !== undefined) station.latitude = lat;
      if (lon !== undefined) station.longitude = lon;
      await station.save();
      return NextResponse.json(station);
    } else {
      // No station record yet — create one
      const newStation = await Station.create({
        name,
        location,
        petrol,
        petrolQty,
        petrolPrice,
        diesel,
        dieselQty,
        dieselPrice,
        ownerUserId: user.id,
        latitude: lat,
        longitude: lon,
        isSetupComplete: true,
      });
      return NextResponse.json(newStation);
    }
  } catch (err) {
    console.error("STATION SETUP ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
