"use client";
import { useEffect, useRef } from "react";

type Station = {
  _id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  location?: { lat: number; lng: number; text?: string };
  petrol?: boolean;
  diesel?: boolean;
};

const MapStations = ({ stations }: { stations: Station[] }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInst = useRef<GoogleMap | null>(null);
  const markers = useRef<GoogleMarker[]>([]);

  const renderMarkers = (data: Station[]) => {
    markers.current.forEach((m) => m.setMap(null));
    markers.current = [];

    const extract = (s: Station) => ({
      lat: typeof s.latitude === "number" ? s.latitude : s.location?.lat,
      lng: typeof s.longitude === "number" ? s.longitude : s.location?.lng,
    });

    const valid = data
      .map(extract)
      .filter((p) => typeof p.lat === "number" && typeof p.lng === "number");

    if (!mapInst.current) {
      return;
    }

    if (valid[0]) {
      mapInst.current.setCenter({
        lat: valid[0].lat as number,
        lng: valid[0].lng as number,
      });
    }
    valid.forEach((p) => {
      const marker = new window.google!.maps!.Marker({
        position: { lat: p.lat as number, lng: p.lng as number },
        map: mapInst.current!,
        title: "Station",
      });
      markers.current.push(marker);
    });
  };

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;
    if (!mapRef.current) return;

    const init = () => {
      if (!mapInst.current) {
        mapInst.current = new window.google!.maps!.Map(mapRef.current!, {
          center: { lat: 8.9806, lng: 38.7578 },
          zoom: 12,
        });
      }
      renderMarkers(stations);
    };

    if (window.google?.maps) {
      init();
      return;
    }

    if (!key) return;

    const existing = document.querySelector('script[data-gmaps="true"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}`;
      script.async = true;
      script.setAttribute("data-gmaps", "true");
      script.onload = init;
      document.head.appendChild(script);
    } else {
      existing.addEventListener("load", init, { once: true });
    }
  }, []);

  useEffect(() => {
    if (window.google?.maps && mapInst.current) {
      renderMarkers(stations);
    }
  }, [stations]);

  return <div className="w-full h-64 rounded-xl" ref={mapRef} />;
};

export default MapStations;