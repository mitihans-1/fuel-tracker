"use client";

import { useEffect, useState } from "react";

interface Station {
  _id: string;
  name: string;
  location: string;
  petrol: boolean;
  diesel: boolean;
}

export default function DriverDashboard() {
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    fetch("/api/stations") // API to fetch stations with fuel status
      .then(res => res.json())
      .then(data => setStations(data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Driver Dashboard</h1>
      {stations.map(station => (
        <div key={station._id} className="border p-4 mb-2">
          <h2 className="font-semibold">{station.name}</h2>
          <p>Location: {station.location}</p>
          <p>Petrol: {station.petrol ? "Available" : "Not Available"}</p>
          <p>Diesel: {station.diesel ? "Available" : "Not Available"}</p>
          <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
            Request Fuel
          </button>
        </div>
      ))}
    </div>
  );
}