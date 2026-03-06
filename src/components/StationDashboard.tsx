"use client";

import { useEffect, useState } from "react";

interface FuelStatus {
  _id: string;
  fuelType: string;
  available: boolean;
}

export default function StationDashboard() {
  const [fuelStatus, setFuelStatus] = useState<FuelStatus[]>([
    { _id: "1", fuelType: "Petrol", available: true },
    { _id: "2", fuelType: "Diesel", available: false },
  ]);

  const toggleAvailability = (id: string) => {
    setFuelStatus(prev =>
      prev.map(f =>
        f._id === id ? { ...f, available: !f.available } : f
      )
    );
    // Here you will call API to update DB
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Station Dashboard</h1>
      {fuelStatus.map(f => (
        <div key={f._id} className="border p-4 mb-2">
          <h2 className="font-semibold">{f.fuelType}</h2>
          <p>Status: {f.available ? "Available" : "Not Available"}</p>
          <button
            onClick={() => toggleAvailability(f._id)}
            className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
          >
            Toggle Status
          </button>
        </div>
      ))}
    </div>
  );
}