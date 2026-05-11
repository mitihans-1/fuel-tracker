import { connectDB } from "@/lib/db";
import Station, { IStation } from "@/models/Station";
import FuelAlertSubscription, { IFuelAlertSubscription } from "@/models/FuelAlertSubscription";
import Notification from "@/models/Notification";
import PriceHistory from "@/models/PriceHistory";
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
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error("Failed to parse request JSON:", error);
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }
    const { id, stationId, petrol, petrolQty, petrolPrice, diesel, dieselQty, dieselPrice, name, location } = requestData;
    const targetStationId = id || stationId;

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

    if (targetStationId) {
      const station = await Station.findOne({ _id: targetStationId, ownerUserId: user.id });
      if (station) {
        if (petrol !== undefined) station.petrol = petrol;
        if (petrolQty !== undefined) station.petrolQty = petrolQty;
        if (petrolPrice !== undefined) station.petrolPrice = petrolPrice;
        if (diesel !== undefined) station.diesel = diesel;
        if (dieselQty !== undefined) station.dieselQty = dieselQty;
        if (dieselPrice !== undefined) station.dieselPrice = dieselPrice;
        if (name) station.name = name;
        if (location) station.location = location;
        if (lat !== undefined) station.latitude = lat;
        if (lon !== undefined) station.longitude = lon;
        const previous = await Station.findById(targetStationId).lean<IStation>();
        await station.save();

        // Record price history on price change
        await recordPriceHistory(station, previous, user.id);
        // Trigger fuel-availability alerts when going from unavailable to available
        await triggerFuelAlerts(station, previous);
        return NextResponse.json(station);
      } else {
        return NextResponse.json({ error: "Station not found" }, { status: 404 });
      }
    } else {
        const station = await Station.findOne({ ownerUserId: user.id });
      if (station) {
        if (petrol !== undefined) station.petrol = petrol;
        if (petrolQty !== undefined) station.petrolQty = petrolQty;
        if (petrolPrice !== undefined) station.petrolPrice = petrolPrice;
        if (diesel !== undefined) station.diesel = diesel;
        if (dieselQty !== undefined) station.dieselQty = dieselQty;
        if (dieselPrice !== undefined) station.dieselPrice = dieselPrice;
        const previous = await Station.findById(station._id).lean<IStation>();
        await station.save();
        await recordPriceHistory(station, previous, user.id);
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

async function recordPriceHistory(
  station: IStation,
  previous: IStation | null,
  userId: string
) {
  try {
    const entries: { stationId: unknown; fuelType: string; price: number; recordedBy: string }[] = [];
    if (!previous || previous.petrolPrice !== station.petrolPrice) {
      entries.push({ stationId: station._id, fuelType: "petrol", price: station.petrolPrice, recordedBy: userId });
    }
    if (!previous || previous.dieselPrice !== station.dieselPrice) {
      entries.push({ stationId: station._id, fuelType: "diesel", price: station.dieselPrice, recordedBy: userId });
    }
    if (entries.length > 0) {
      await PriceHistory.insertMany(entries);
    }
  } catch (err) {
    console.error("recordPriceHistory error", err);
  }
}

async function triggerFuelAlerts(
  station: IStation,
  previous: IStation | null
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
      }).lean<IFuelAlertSubscription[]>();

      if (!subs.length) continue;

      const notifications = subs.map((s) => ({
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