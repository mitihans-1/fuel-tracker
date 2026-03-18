"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
// CSS moved to globals.css: @import "leaflet/dist/leaflet.css";

// Fix Leaflet’s default icon paths in Next.js
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

interface StaticImageData {
  src: string;
  height: number;
  width: number;
  blurDataURL?: string;
  blurWidth?: number;
  blurHeight?: number;
}

export interface Station {
  _id: string;
  name: string;
  location: { lat: number; lng: number; text: string } | string;
  latitude?: number;
  longitude?: number;
}

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
    const zoom = (map.getZoom && map.getZoom()) || 12;
    map.setView(center, zoom, { animate: true });
  }, [center, map]);
  return null;
};

export default function OSMMap({ stations, centerTo }: { stations: Station[]; centerTo?: { lat: number; lng: number } }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Fix Leaflet’s default icon paths only in browser
    const getSrc = (asset: string | StaticImageData) => 
      typeof asset === 'string' ? asset : asset.src;

    const DefaultIcon = L.icon({
      iconRetinaUrl: getSrc(iconRetinaUrl as unknown as StaticImageData),
      iconUrl: getSrc(iconUrl as unknown as StaticImageData),
      shadowUrl: getSrc(shadowUrl as unknown as StaticImageData),
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = DefaultIcon;
    
    // Defer state update to avoid cascading renders warning
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const first = stations.find((s) => {
    const p = pickCoords(s);
    return typeof p.lat === "number" && typeof p.lng === "number";
  });

  const coords = first ? pickCoords(first) : null;
  const center: [number, number] =
    coords && typeof coords.lat === "number" && typeof coords.lng === "number"
      ? [coords.lat, coords.lng]
      : [8.9806, 38.7578]; // Addis fallback

  if (!mounted) return <div className="w-full h-full bg-slate-900/50 animate-pulse" />;

  return (
    <div className="w-full h-full relative">
      <MapContainer 
        center={center} 
        zoom={12} 
        className="w-full h-full" 
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {centerTo && Number.isFinite(centerTo.lat) && Number.isFinite(centerTo.lng) && (
          <Centerer center={[centerTo.lat, centerTo.lng]} />
        )}
        {stations.map((s) => {
          const p = pickCoords(s);
          if (typeof p.lat !== "number" || typeof p.lng !== "number") return null;
          return (
            <Marker key={s._id} position={[p.lat, p.lng]}>
              <Popup>
                <div className="text-slate-900">
                  <strong className="block border-b border-slate-100 mb-1 pb-1">{s.name}</strong>
                  <span className="text-xs opacity-70">
                    {typeof s.location === 'object' && s.location?.text ? s.location.text : typeof s.location === 'string' ? s.location : 'No address'}
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}