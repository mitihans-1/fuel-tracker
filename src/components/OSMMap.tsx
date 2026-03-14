"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
// CSS moved to globals.css: @import "leaflet/dist/leaflet.css";

export interface Station {
  _id: string;
  name: string;
  location: { lat: number; lng: number; text: string } | string;
  latitude?: number;
  longitude?: number;
}

// Fix Leaflet’s default icon paths in Next.js
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const pickCoords = (s: Station) => {
  if (typeof s.latitude === 'number' && typeof s.longitude === 'number') {
    return { lat: s.latitude, lng: s.longitude };
  }
  if (typeof s.location === 'object' && s.location !== null) {
    return { lat: s.location.lat, lng: s.location.lng };
  }
  return { lat: undefined, lng: undefined };
};

const Centerer = ({ center }: { center?: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (!center || !Number.isFinite(center[0]) || !Number.isFinite(center[1])) {
      return;
    }
    // keep zoom, animate to new center
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    const zoom = (map.getZoom && map.getZoom()) || 12;
    map.setView(center, zoom, { animate: true });
  }, [center, map]);
  return null;
};

export default function OSMMap({ stations, centerTo }: { stations: Station[]; centerTo?: { lat: number; lng: number } }) {
  const first = stations.find((s) => {
    const { lat, lng } = pickCoords(s);
    return typeof lat === "number" && typeof lng === "number";
  });

  const center: [number, number] =
    first ? [pickCoords(first).lat!, pickCoords(first).lng!] : [8.9806, 38.7578]; // Addis fallback

  return (
    <MapContainer center={center} zoom={12} className="w-full h-full">
     <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {centerTo ? <Centerer center={[centerTo.lat, centerTo.lng]} /> : null}
      {stations.map((s) => {
        const p = pickCoords(s);
        if (typeof p.lat !== "number" || typeof p.lng !== "number") return null;
        return (
          <Marker key={s._id} position={[p.lat, p.lng]}>
            <Popup>
              <strong>{s.name}</strong>
              {typeof s.location === 'object' && s.location?.text ? <div>{s.location.text}</div> : typeof s.location === 'string' ? <div>{s.location}</div> : null}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}