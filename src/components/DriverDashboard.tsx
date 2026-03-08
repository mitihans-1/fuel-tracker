"use client";

import { useEffect, useState } from "react";

interface Station {
  _id: string;
  name: string;
  location: string;
  petrol: boolean;
  diesel: boolean;
}

interface FuelRequest {
  _id: string;
  stationId: { name: string; location: string }; // populated from DB
  fuelType: string;
  status: string;
}

export default function DriverDashboard() {
  const [stations, setStations] = useState<Station[]>([]);
  const [requests, setRequests] = useState<FuelRequest[]>([]);

  // Fetch stations
  useEffect(() => {
    fetch("/api/stations")
      .then(res => res.json())
      .then(data => setStations(data));
  }, []);

  // Fetch driver requests
  useEffect(() => {
    // Replace "USER_ID" with token-based auth in future
    const userId = "USER_ID"; 
    fetch(`/api/requests/driver?driverId=${userId}`)
      .then(res => res.json())
      .then(data => setRequests(data));
  }, []);

  // Request Fuel function
  const requestFuel = async (stationId: string, fuelType: string) => {
    // Replace "USER_ID" with token-based auth in future
    const userId = "USER_ID";

    await fetch("/api/requests/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driverId: userId, stationId, fuelType }),
    });

    alert("Fuel request sent");

    // Refresh request history
    fetch(`/api/requests/driver?driverId=${userId}`)
      .then(res => res.json())
      .then(data => setRequests(data));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Driver Dashboard</h1>

      {/* Stations List */}
      {stations.map(station => (
        <div key={station._id} className="border p-4 mb-2">
          <h2 className="font-semibold">{station.name}</h2>
          <p>Location: {station.location}</p>
          <p>Petrol: {station.petrol ? "Available" : "Not Available"}</p>
          <p>Diesel: {station.diesel ? "Available" : "Not Available"}</p>
          <button
            onClick={() => requestFuel(station._id, "petrol")}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Request Petrol
          </button>
          <button
            onClick={() => requestFuel(station._id, "diesel")}
            className="mt-2 ml-2 bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Request Diesel
          </button>
        </div>
      ))}

      {/* Request History */}
      <h2 className="text-xl font-bold mt-6 mb-2">Your Fuel Requests</h2>
      {requests.length === 0 && <p>No requests yet</p>}
      {requests.map(request => (
        <div key={request._id} className="border p-4 mb-2">
          <p>Station: {request.stationId.name}</p>
          <p>Location: {request.stationId.location}</p>
          <p>Fuel Type: {request.fuelType}</p>
          <p>Status: {request.status}</p>
        </div>
      ))}
    </div>
  );
}