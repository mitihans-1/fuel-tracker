"use client";

import { useEffect, useState } from "react";

interface FuelStatus {
  _id: string;
  fuelType: string;
  available: boolean;
}

interface FuelRequest {
  _id: string;
  driverId: { name: string }; // populated from DB
  fuelType: string;
  status: string;
}

export default function StationDashboard() {
  // Fuel availability state
  const [fuelStatus, setFuelStatus] = useState<FuelStatus[]>([
    { _id: "1", fuelType: "Petrol", available: true },
    { _id: "2", fuelType: "Diesel", available: false },
  ]);

  // Driver requests state
  const [requests, setRequests] = useState<FuelRequest[]>([]);

  // Toggle fuel availability
  const toggleAvailability = (id: string) => {
    setFuelStatus(prev =>
      prev.map(f =>
        f._id === id ? { ...f, available: !f.available } : f
      )
    );

    // Call API to update DB (replace with actual API)
    fetch("/api/stations/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        petrol: fuelStatus.find(f => f._id === id)?.fuelType === "Petrol" ? !fuelStatus.find(f => f._id === id)?.available : fuelStatus.find(f => f._id === id)?.available,
        diesel: fuelStatus.find(f => f._id === id)?.fuelType === "Diesel" ? !fuelStatus.find(f => f._id === id)?.available : fuelStatus.find(f => f._id === id)?.available
      })
    });
  };

  // Fetch driver requests on load
  useEffect(() => {
    fetch("/api/requests/station")
      .then(res => res.json())
      .then(data => setRequests(data));
  }, []);

  // Approve request
  const approveRequest = async (requestId: string) => {
    await fetch("/api/requests/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, status: "APPROVED" }),
    });

    // Update local state to reflect approval
    setRequests(prev =>
      prev.map(r =>
        r._id === requestId ? { ...r, status: "APPROVED" } : r
      )
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Station Dashboard</h1>

      {/* Fuel Availability Section */}
      <h2 className="text-xl font-semibold mb-2">Fuel Status</h2>
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

      {/* Driver Requests Section */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Driver Fuel Requests</h2>
      {requests.map(request => (
        <div key={request._id} className="border p-4 mb-2">
          <p>Driver: {request.driverId.name}</p>
          <p>Fuel Type: {request.fuelType}</p>
          <p>Status: {request.status}</p>
          {request.status === "PENDING" && (
            <button
              onClick={() => approveRequest(request._id)}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Approve
            </button>
          )}
        </div>
      ))}
    </div>
  );
}