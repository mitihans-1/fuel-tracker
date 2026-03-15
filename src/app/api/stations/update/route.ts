import { connectDB } from "@/lib/db";
import Station from "@/models/Station";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function PUT(req: Request) {
  await connectDB();

  const cookieStore = cookies();
  const token =  (await cookieStore).get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  const user = verifyToken(token);
  if (!user || user.role !== "STATION") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  interface StationUpdate {
    petrol?: boolean;
    petrolQty?: number;
    petrolPrice?: number;
    diesel?: boolean;
    dieselQty?: number;
    dieselPrice?: number;
    name?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    updatedAt: Date;
  }

  const { id, petrol, petrolQty, petrolPrice, diesel, dieselQty, dieselPrice, name, location } = await req.json();

  let lat: number | undefined;
  let lon: number | undefined;

  if (location) {
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
      console.error("Geocoding failed during update:", err);
    }
  }

  let station;
  if (id) {
    const updateData: StationUpdate = { petrol, petrolQty, petrolPrice, diesel, dieselQty, dieselPrice, updatedAt: new Date() };
    if (name) updateData.name = name;
    if (location) updateData.location = location;
    if (lat !== undefined) updateData.latitude = lat;
    if (lon !== undefined) updateData.longitude = lon;

    station = await Station.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  } else {
    const updateData: StationUpdate = { petrol, petrolQty, petrolPrice, diesel, dieselQty, dieselPrice, updatedAt: new Date() };
    if (name) updateData.name = name;
    if (location) updateData.location = location;
    if (lat !== undefined) updateData.latitude = lat;
    if (lon !== undefined) updateData.longitude = lon;

    station = await Station.findOneAndUpdate(
      { ownerUserId: user.id },
      updateData,
      { new: true }
    );
    if (!station) {
      station = await Station.create({
        name: name || "Station",
        location: location || "Unknown",
        petrol: !!petrol,
        petrolQty: petrolQty || 0,
        petrolPrice: petrolPrice || 80,
        diesel: !!diesel,
        dieselQty: dieselQty || 0,
        dieselPrice: dieselPrice || 75,
        ownerUserId: user.id,
        latitude: lat,
        longitude: lon,
        updatedAt: new Date(),
      });
    }
  }

  return NextResponse.json(station);
}