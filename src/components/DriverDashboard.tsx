"use client";

import React, { useState, useEffect } from "react";
import OSMMap from "@/components/OSMMap";
interface Station {
  _id: string;
  name: string;
  location: { lat: number; lng: number; text: string };
  petrol: boolean;
  diesel: boolean;
}

interface FuelRequest {
  _id: string;
  stationId: { name: string };
  fuelType: string;
  status: string;
  createdAt?: string;
}

const PAGE_SIZE = 6;

export default function DriverDashboard() {
  const [stations, setStations] = useState<Station[]>([]);
  const [requests, setRequests] = useState<FuelRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingStations, setLoadingStations] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  // Fetch stations
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoadingStations(true);
        const res = await fetch(`/api/stations?page=${page}&limit=${PAGE_SIZE}`);
        if (!res.ok) throw new Error("Failed to fetch stations");
        const data = await res.json();
        setStations(data);
      } catch (err) {
        setError("Could not load stations");
      } finally {
        setLoadingStations(false);
      }
    };
    fetchStations();
  }, [page]);

  // Fetch driver requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch("/api/request/driver");
        const data = await res.json();
        setRequests(data);
      } catch {
        alert("Failed to load your requests");
      }
    };
    fetchRequests();
  }, []);

  // Real-time updates using EventSource
  useEffect(() => {
    const es = new EventSource("/api/stations/stream");
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setStations(data);
    };
    return () => es.close();
  }, []);

  const requestFuel = async (stationId: string, fuelType: string) => {
    try {
      const res = await fetch("/api/stations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stationId, fuelType }),
      });
      if (res.ok) {
        alert(`${fuelType} request sent!`);
        const reqRes = await fetch("/api/request/driver");
        const data = await reqRes.json();
        setRequests(data);
      } else {
        alert("Failed to send request");
      }
    } catch {
      alert("Error requesting fuel");
    }
  };

  // Filter stations by search query
  const filteredStations = stations.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const stats = {
    totalRequests: requests.length,
    pendingCount: requests.filter((r) => r.status === "PENDING").length,
    approvedCount: requests.filter((r) => r.status === "APPROVED").length,
  };

  const totalPages = Math.ceil(filteredStations.length / PAGE_SIZE);
  const paginatedStations = filteredStations.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Driver Dashboard
            </h1>
            <p className="text-blue-200/70 mt-2 text-lg">
              Request fuel and find available stations easily.
            </p>
          </div>

          {/* STATS */}
          <div className="flex bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="px-6 py-3 text-center border-r border-white/10">
              <p className="text-xs text-blue-200 uppercase">Total</p>
              <p className="text-2xl font-bold">{stats.totalRequests}</p>
            </div>
            <div className="px-6 py-3 text-center border-r border-white/10">
              <p className="text-xs text-blue-200 uppercase">Pending</p>
              <p className="text-2xl font-bold text-orange-400">
                {stats.pendingCount}
              </p>
            </div>
            <div className="px-6 py-3 text-center">
              <p className="text-xs text-blue-200 uppercase">Approved</p>
              <p className="text-2xl font-bold text-green-400">
                {stats.approvedCount}
              </p>
            </div>
          </div>
        </header>

        {/* SEARCH & MAP */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              Available Stations
              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 text-sm rounded-full">
                {filteredStations.length}
              </span>
            </h2>

            <input
              type="text"
              placeholder="Search stations or locations..."
              className="w-full sm:w-72 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200 focus:ring-2 focus:ring-blue-500 outline-none backdrop-blur-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loadingStations ? (
            <div className="text-center py-12">Loading stations...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-400">{error}</div>
          ) : (
            <>
              {/* Map */}
            <div className="h-48 sm:h-64 md:h-80 rounded-xl overflow-hidden mb-6">
  <OSMMap stations={filteredStations} />
</div>

              {/* STATION GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedStations.map((station) => (
                  <div
                    key={station._id}
                    className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/20 hover:scale-[1.03] transition-all duration-300 shadow-xl"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-xl text-white">
                          {station.name}
                        </h3>
                        <p className="text-blue-200 text-sm mt-1">
                          📍 {station.location.text}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold ${
                          station.petrol || station.diesel
                            ? "bg-green-500/20 text-green-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {station.petrol || station.diesel ? "OPEN" : "CLOSED"}
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span>⛽ Petrol</span>
                        <span
                          className={station.petrol ? "text-green-400" : "text-red-400"}
                        >
                          {station.petrol ? "Available" : "Out of Stock"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>🛢 Diesel</span>
                        <span
                          className={station.diesel ? "text-green-400" : "text-red-400"}
                        >
                          {station.diesel ? "Available" : "Out of Stock"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        disabled={!station.petrol}
                        onClick={() => requestFuel(station._id, "petrol")}
                        className={`flex-1 rounded-xl py-3 font-semibold transition ${
                          station.petrol
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Request Petrol
                      </button>
                      <button
                        disabled={!station.diesel}
                        onClick={() => requestFuel(station._id, "diesel")}
                        className={`flex-1 rounded-xl py-3 font-semibold transition ${
                          station.diesel
                            ? "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Request Diesel
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-4 py-2 bg-blue-500 rounded disabled:bg-gray-500"
                  >
                    Previous
                  </button>
                  <span className="px-2 py-2">{page} / {totalPages}</span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-4 py-2 bg-blue-500 rounded disabled:bg-gray-500"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* REQUEST HISTORY */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Request History</h2>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 overflow-x-auto shadow-xl">
            <table className="min-w-[600px] w-full">
              <thead className="bg-white/10 text-blue-200 text-sm">
                <tr>
                  <th className="px-6 py-4 text-left">Station</th>
                  <th className="px-6 py-4 text-left">Fuel</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r._id} className="border-t border-white/10 hover:bg-white/10 transition">
                    <td className="px-6 py-4 font-semibold">{r.stationId.name}</td>
                    <td className="px-6 py-4 capitalize">{r.fuelType}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          r.status === "PENDING"
                            ? "bg-orange-500/20 text-orange-300"
                            : r.status === "APPROVED"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-blue-200 text-sm">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-blue-200">
                      No fuel requests yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}