"use client";

import { useEffect, useState } from "react";

interface FuelRequest {
  _id: string;
  driverId: { name: string };
  fuelType: string;
  status: string;
  createdAt?: string;
}

export default function StationDashboard() {
  const [petrol, setPetrol] = useState(true);
  const [diesel, setDiesel] = useState(true);
  const [requests, setRequests] = useState<FuelRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

  useEffect(() => {
    fetch("/api/requests/station")
      .then(res => res.json())
      .then(data => setRequests(data));
  }, []);

  const updateFuel = async () => {
    try {
      const response = await fetch("/api/stations/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petrol, diesel }),
      });

      if (response.ok) {
        alert("Fuel availability status updated successfully!");
      }
    } catch (error) {
       console.error("Failed to update fuel:", error);
    }
  };

  const updateRequest = async (id: string, status: string) => {
    try {
      await fetch("/api/requests/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id, status }),
      });

      setRequests(prev =>
        prev.map(r => (r._id === id ? { ...r, status } : r))
      );
    } catch (error) {
       console.error("Failed to update request:", error);
    }
  };

  const pendingRequests = requests.filter(r => r.status === "PENDING");
  const historyRequests = requests.filter(r => r.status !== "PENDING");

  const stats = {
    pending: pendingRequests.length,
    approvedToday: requests.filter(r => r.status === "APPROVED").length,
    rejectedToday: requests.filter(r => r.status === "REJECTED").length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">
            Station Console
          </h1>
          <p className="text-gray-500 mt-1">Monitor fuel stock and manage driver requests in real-time.</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${petrol ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              ⛽
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Petrol Stock</p>
              <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${petrol ? 'bg-green-500' : 'bg-red-500'}`}></div>
                 <p className="font-bold text-gray-900">{petrol ? 'Available' : 'Empty'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${diesel ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              🚛
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Diesel Stock</p>
              <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${diesel ? 'bg-green-500' : 'bg-red-500'}`}></div>
                 <p className="font-bold text-gray-900">{diesel ? 'Available' : 'Empty'}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Management */}
        <div className="lg:col-span-1 space-y-8">
          {/* Inventory Controls */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Inventory Management</h2>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="font-semibold">Petrol Availability</span>
                <input
                  type="checkbox"
                  className="w-6 h-6 rounded-md text-blue-600 focus:ring-blue-500"
                  checked={petrol}
                  onChange={() => setPetrol(!petrol)}
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="font-semibold">Diesel Availability</span>
                <input
                  type="checkbox"
                  className="w-6 h-6 rounded-md text-yellow-600 focus:ring-yellow-500"
                  checked={diesel}
                  onChange={() => setDiesel(!diesel)}
                />
              </label>
            </div>

            <button
              onClick={updateFuel}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-200 mt-6"
            >
              Update Live Status
            </button>
          </section>

          {/* Quick Stats Summary */}
          <section className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200 mt-8 space-y-4">
            <h3 className="font-bold opacity-80 uppercase text-xs tracking-[0.2em]">Live Insights</h3>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
                  <p className="text-2xl font-bold">{stats.approvedToday}</p>
                  <p className="text-[10px] font-medium opacity-60">Approved Today</p>
               </div>
               <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-[10px] font-medium opacity-60">Waitlist Size</p>
               </div>
            </div>
          </section>
        </div>

        {/* Right Column: Requests */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex border-b border-gray-100">
            <button 
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'pending' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}
            >
              Queue Management ({pendingRequests.length})
            </button>
            <button 
              onClick={() => setActiveTab("history")}
              className={`px-6 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}
            >
              Recent Fulfillment
            </button>
          </div>

          <div className="space-y-4">
            {(activeTab === "pending" ? pendingRequests : historyRequests).map(r => (
              <div key={r._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                    {r.driverId.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{r.driverId.name}</h4>
                    <p className="text-xs text-gray-400">Requested {r.fuelType} • {r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {r.status === "PENDING" ? (
                    <>
                      <button
                        onClick={() => updateRequest(r._id, "REJECTED")}
                        className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => updateRequest(r._id, "APPROVED")}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-green-100"
                      >
                        Approve & Fill
                      </button>
                    </>
                  ) : (
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      r.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {r.status}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {(activeTab === "pending" ? pendingRequests : historyRequests).length === 0 && (
              <div className="text-center py-20 opacity-40">
                <p className="text-4xl mb-4">🛸</p>
                <p className="font-bold text-gray-500">The queue is currently empty.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}