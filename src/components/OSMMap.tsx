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
  petrol?: boolean;
  diesel?: boolean;
  petrolQty?: number;
  dieselQty?: number;
  petrolPrice?: number;
  dieselPrice?: number;
  estimatedWaitMinutes?: number;
  avgRating?: number;
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
          
          const isOperational = s.petrol || s.diesel;
          const markerColor = s.petrol ? "#6366f1" : s.diesel ? "#f59e0b" : "#475569";
          
          const customIcon = L.divIcon({
            className: "custom-tactical-marker",
            html: `
              <div class="relative w-8 h-8 flex items-center justify-center">
                <div class="absolute inset-0 rounded-full animate-pulsate opacity-40 shadow-[0_0_15px_rgba(0,0,0,0.5)]" style="background-color: ${markerColor}"></div>
                <div class="w-2.5 h-2.5 rounded-full z-10 border-2 border-white/40 shadow-[0_0_8px_rgba(255,255,255,0.5)]" style="background-color: ${markerColor}"></div>
                ${isOperational ? `<div class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"></div>` : ''}
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16]
          });
          
          return (
            <Marker key={s._id} position={[p.lat, p.lng]} icon={customIcon}>
              <Popup className="tactical-map-popup">
                <div className="w-64 p-2 bg-slate-900 text-white rounded-2xl overflow-hidden border border-white/10">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-black uppercase tracking-tight truncate flex-1">{s.name}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border ${
                      isOperational ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"
                    }`}>
                      {isOperational ? "Active" : "Offline"}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center text-[10px] font-medium text-slate-400">
                      <span className="flex items-center gap-1 opacity-60">Wait Est:</span>
                      <span className={`font-black uppercase tracking-tighter ${s.estimatedWaitMinutes && s.estimatedWaitMinutes > 20 ? "text-amber-400" : "text-emerald-400"}`}>
                        {s.estimatedWaitMinutes ? `~${s.estimatedWaitMinutes}m` : "No Queue"}
                      </span>
                    </div>
                    {s.petrol && (
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Benzene</span>
                        <span className="text-xs font-black text-indigo-300 tracking-tight">{s.petrolPrice ?? 80}<span className="text-[8px] ml-1 opacity-40">ETB</span></span>
                      </div>
                    )}
                    {s.diesel && (
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nafta</span>
                        <span className="text-xs font-black text-amber-300 tracking-tight">{s.dieselPrice ?? 75}<span className="text-[8px] ml-1 opacity-40">ETB</span></span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 opacity-60 text-[9px] font-medium border-t border-white/5 pt-2">
                    <span className="flex-1 truncate uppercase tracking-tighter">
                      {typeof s.location === 'object' && s.location?.text ? s.location.text : typeof s.location === 'string' ? s.location : 'No addr'}
                    </span>
                    {s.avgRating && (
                      <span className="flex items-center gap-1 text-yellow-500 font-black">★ {s.avgRating.toFixed(1)}</span>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}