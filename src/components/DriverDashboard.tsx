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
  stationId: { name: string };
  fuelType: string;
  status: string;
  createdAt?: string;
}

export default function DriverDashboard() {
  const [stations, setStations] = useState<Station[]>([]);
  const [requests, setRequests] = useState<FuelRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/stations")
      .then(res => res.json())
      .then(data => setStations(data));
  }, []);

  useEffect(() => {
    fetch("/api/requests/driver")
      .then(res => res.json())
      .then(data => setRequests(data));
  }, []);

  const requestFuel = async (stationId: string, fuelType: string) => {
    try {
      const response = await fetch("/api/stations/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stationId, fuelType }),
      });

      if (response.ok) {
        alert(`Fuel request for ${fuelType} sent successfully!`);
        // Refresh requests
        const reqRes = await fetch("/api/requests/driver");
        const data = await reqRes.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Failed to request fuel:", error);
    }
  };

  const filteredStations = stations.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalRequests: requests.length,
    pendingCount: requests.filter(r => r.status === "PENDING").length,
    approvedCount: requests.filter(r => r.status === "APPROVED").length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Driver Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Welcome back! Manage your fuel requests and find stations.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
           <div className="px-4 py-2 text-center border-r border-gray-100">
             <p className="text-xs text-gray-400 uppercase font-semibold">Total</p>
             <p className="text-xl font-bold text-gray-800">{stats.totalRequests}</p>
           </div>
           <div className="px-4 py-2 text-center border-r border-gray-100">
             <p className="text-xs text-gray-400 uppercase font-semibold">Pending</p>
             <p className="text-xl font-bold text-orange-500">{stats.pendingCount}</p>
           </div>
           <div className="px-4 py-2 text-center">
             <p className="text-xs text-gray-400 uppercase font-semibold">Approved</p>
             <p className="text-xl font-bold text-green-500">{stats.approvedCount}</p>
           </div>
        </div>
      </header>

      {/* Available Stations Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span>Available Stations</span>
            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">{filteredStations.length}</span>
          </h2>
          <input 
            type="text" 
            placeholder="Search stations or locations..." 
            className="w-full sm:w-64 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStations.map(station => (
            <div key={station._id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 p-6 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">{station.name}</h3>
                  <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                    <span className="opacity-70">📍</span> {station.location}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${station.petrol || station.diesel ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {station.petrol || station.diesel ? 'Open' : 'Closed'}
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Petrol</span>
                  <span className={`font-medium ${station.petrol ? 'text-green-600' : 'text-red-500'}`}>
                    {station.petrol ? '✅ Available' : '❌ Out of Stock'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Diesel</span>
                  <span className={`font-medium ${station.diesel ? 'text-green-600' : 'text-red-500'}`}>
                    {station.diesel ? '✅ Available' : '❌ Out of Stock'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  disabled={!station.petrol}
                  onClick={() => requestFuel(station._id, "petrol")}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    station.petrol 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Request Petrol
                </button>

                <button
                  disabled={!station.diesel}
                  onClick={() => requestFuel(station._id, "diesel")}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    station.diesel 
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg shadow-yellow-200' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Request Diesel
                </button>
              </div>
            </div>
          ))}
        </div>
        {filteredStations.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500">No stations found matching your search.</p>
          </div>
        )}
      </section>

      {/* Request History Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Request History</h2>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Station</th>
                  <th className="px-6 py-4">Fuel Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{r.stationId.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium uppercase ${r.fuelType === 'petrol' ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'}`}>
                        {r.fuelType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        r.status === 'PENDING' ? 'bg-orange-100 text-orange-600' :
                        r.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          r.status === 'PENDING' ? 'bg-orange-600 animate-pulse' :
                          r.status === 'APPROVED' ? 'bg-green-600' :
                          'bg-red-600'
                        }`}></span>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      You haven&apos;t made any requests yet. Start by finding a station above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}