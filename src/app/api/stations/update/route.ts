import { connectDB } from "@/lib/db";
import Station from "@/models/Station";
import FuelAlertSubscription from "@/models/FuelAlertSubscription";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function PUT(req: Request) {
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  const user = verifyToken(token);
  if (!user || user.role !== "STATION") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error("Failed to parse request JSON:", error);
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }
    const { id, petrol, petrolQty, petrolPrice, diesel, dieselQty, dieselPrice, name, location } = requestData;

  try {
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

    if (id) {
      const station = await Station.findById(id);
      if (station) {
        station.petrol = petrol;
        station.petrolQty = petrolQty;
        station.petrolPrice = petrolPrice;
        station.diesel = diesel;
        station.dieselQty = dieselQty;
        station.dieselPrice = dieselPrice;
        if (name) station.name = name;
        if (location) station.location = location;
        if (lat !== undefined) station.latitude = lat;
        if (lon !== undefined) station.longitude = lon;
        const previous = await Station.findById(id).lean();
        await station.save();

        // Trigger fuel-availability alerts when going from unavailable to available
        await triggerFuelAlerts(station, previous);
        return NextResponse.json(station);
      } else {
        return NextResponse.json({ error: "Station not found" }, { status: 404 });
      }
    } else {
      const station = await Station.findOne({ ownerUserId: user.id });
      if (station) {
        station.petrol = petrol;
        station.petrolQty = petrolQty;
        station.petrolPrice = petrolPrice;
        station.diesel = diesel;
        station.dieselQty = dieselQty;
        station.dieselPrice = dieselPrice;
        const previous = await Station.findById(station._id).lean();
        await station.save();
        await triggerFuelAlerts(station, previous);
        return NextResponse.json(station);
      } else {
        const newStation = await Station.create({
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
        });
        await triggerFuelAlerts(newStation, null);
        return NextResponse.json(newStation);
      }
    }
  } catch (error) {
    console.error("Error in stations update:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function triggerFuelAlerts(
  station: any,
  previous: any | null
) {
  try {
    const nowHasPetrol = !!station.petrol && (station.petrolQty ?? 0) > 0;
    const prevHadPetrol =
      previous && !!previous.petrol && (previous.petrolQty ?? 0) > 0;

    const nowHasDiesel = !!station.diesel && (station.dieselQty ?? 0) > 0;
    const prevHadDiesel =
      previous && !!previous.diesel && (previous.dieselQty ?? 0) > 0;

    const events: ("petrol" | "diesel")[] = [];
    if (nowHasPetrol && !prevHadPetrol) events.push("petrol");
    if (nowHasDiesel && !prevHadDiesel) events.push("diesel");

    if (events.length === 0) return;

    const stationId = station._id;

    for (const fuelType of events) {
      const subs = await FuelAlertSubscription.find({
        stationId,
        fuelType,
        active: true,
      }).lean();

      if (!subs.length) continue;

      const notifications = subs.map((s: any) => ({
        userId: s.driverId,
        type: "FUEL_AVAILABLE" as const,
        title: "Fuel available",
        message: `${fuelType.toUpperCase()} is now available at ${station.name}`,
        read: false,
        meta: {
          stationId,
          fuelType,
        },
      }));

      await Notification.insertMany(notifications);
    }
  } catch (err) {
    console.error("triggerFuelAlerts error", err);
  }
}