"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
// CSS moved to globals.css: @import "leaflet/dist/leaflet.css";

type Station = {
  _id: string;
  name: string;
  location?: { lat: number; lng: number; text?: string };
  latitude?: number;
  longitude?: number;
};

// Fix Leaflet’s default icon paths in Next.js
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const pickCoords = (s: Station) => ({
  lat: typeof s.latitude === "number" ? s.latitude : s.location?.lat,
  lng: typeof s.longitude === "number" ? s.longitude : s.location?.lng,
});

export default function OSMMap({ stations }: { stations: Station[] }) {
  const first = stations.find((s) => {
    const { lat, lng } = pickCoords(s);
    return typeof lat === "number" && typeof lng === "number";
  });

  const center: [number, number] =
    first ? [pickCoords(first).lat!, pickCoords(first).lng!] : [8.9806, 38.7578]; // Addis fallback

  return (
    <MapContainer center={center} zoom={12} className="w-full h-full">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {stations.map((s) => {
        const p = pickCoords(s);
        if (typeof p.lat !== "number" || typeof p.lng !== "number") return null;
        return (
          <Marker key={s._id} position={[p.lat, p.lng]}>
            <Popup>
              <strong>{s.name}</strong>
              {s.location?.text ? <div>{s.location.text}</div> : null}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}