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
    fetch("/api/request/station")
      .then(res => res.json())
      .then(data => setRequests(data));

    // Fetch current station status to initialize checkboxes
    fetch("/api/stations/update", { method: "PUT", body: JSON.stringify({}), headers: { "Content-Type": "application/json" } })
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setPetrol(!!data.petrol);
          setDiesel(!!data.diesel);
        }
      })
      .catch(err => console.error("Failed to fetch initial status:", err));
  }, []);

  const updateFuel = async () => {
    try {
      const response = await fetch("/api/stations/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petrol, diesel }),
      });

      if (response.ok) {
        const data = await response.json();
        setPetrol(!!data.petrol);
        setDiesel(!!data.diesel);
        alert("Fuel availability status updated successfully!");
      } else {
        const errorData = await response.json();
        alert(`Update failed: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
       console.error("Failed to update fuel:", error);
       alert("An error occurred while updating status.");
    }
  };

  const updateRequest = async (id: string, status: string) => {
    try {
      await fetch("/api/request/update", {
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
   <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white p-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Station Console
          </h1>
          <p className="text-gray-300 mt-1">Monitor fuel stock and manage driver requests in real-time.</p>
        </div>

        <div className="flex gap-4">
          <div className={`flex items-center gap-4 p-4 rounded-2xl shadow-lg border ${petrol ? "border-green-500 bg-green-950" : "border-red-500 bg-red-950"}`}>
            <div className={`w-12 h-12 flex items-center justify-center rounded-full text-2xl ${petrol ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
              ⛽
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-wide opacity-70">Petrol Stock</p>
              <div className="flex items-center gap-2">
                 <p className={`font-bold text-lg ${petrol ? "text-green-400" : "text-red-400"}`}>{petrol ? "Available" : "Empty"}</p>
              </div>
            </div>
          </div>

          <div className={`flex items-center gap-4 p-4 rounded-2xl shadow-lg border ${diesel ? "border-green-500 bg-green-950" : "border-red-500 bg-red-950"}`}>
            <div className={`w-12 h-12 flex items-center justify-center rounded-full text-2xl ${diesel ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
              🚛
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-wide opacity-70">Diesel Stock</p>
              <div className="flex items-center gap-2">
                 <p className={`font-bold text-lg ${diesel ? "text-green-400" : "text-red-400"}`}>{diesel ? "Available" : "Empty"}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Management */}
        <div className="lg:col-span-1 space-y-8">
          {/* Inventory Controls */}
          <section className="bg-gray-800 rounded-3xl p-6 shadow-lg space-y-6">
            <h2 className="text-xl font-bold tracking-tight">Inventory Management</h2>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 rounded-2xl bg-gray-700 hover:bg-gray-600 cursor-pointer transition">
                <span className="font-semibold">Petrol Availability</span>
                <input
                  type="checkbox"
                  className="w-6 h-6 text-blue-500 rounded"
                  checked={petrol}
                  onChange={() => setPetrol(!petrol)}
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-2xl bg-gray-700 hover:bg-gray-600 cursor-pointer transition">
                <span className="font-semibold">Diesel Availability</span>
                <input
                  type="checkbox"
                  className="w-6 h-6 text-yellow-500 rounded"
                  checked={diesel}
                  onChange={() => setDiesel(!diesel)}
                />
              </label>
            </div>

            <button onClick={updateFuel} className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold shadow-lg transition-all">
              Update Live Status
            </button>
          </section>

          {/* Stats */}
          <section className="bg-gradient-to-br from-indigo-700 to-blue-700 rounded-3xl p-6 shadow-xl space-y-4 text-white">
            <h3 className="uppercase text-xs font-bold tracking-wider opacity-80">Live Insights</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 p-4 rounded-2xl text-center border border-white/20">
                <p className="text-2xl font-bold">{stats.approvedToday}</p>
                <p className="text-xs opacity-70">Approved Today</p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl text-center border border-white/20">
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs opacity-70">Pending Requests</p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl text-center border border-white/20">
                <p className="text-2xl font-bold">{stats.rejectedToday}</p>
                <p className="text-xs opacity-70">Rejected Today</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Requests */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex border-b border-gray-600">
            <button 
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'pending' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400'}`}
            >
              Queue Management ({pendingRequests.length})
            </button>
            <button 
              onClick={() => setActiveTab("history")}
              className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'history' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400'}`}
            >
              Recent Fulfillment
            </button>
          </div>

          <div className="space-y-4">
            {(activeTab === "pending" ? pendingRequests : historyRequests).map(r => (
              <div key={r._id} className="bg-gray-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-lg transition-shadow border border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-bold">
                    {r.driverId?.name?.charAt(0) ?? "?"}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{r.driverId?.name ?? "Unknown Driver"}</h4>
                    <p className="text-xs text-gray-400"> Requested {r.fuelType} • {r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {r.status === "PENDING" ? (
                    <>
                      <button
                        onClick={() => updateRequest(r._id, "REJECTED")}
                        className="px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-600/20 rounded-xl transition"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => updateRequest(r._id, "APPROVED")}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl shadow-md transition"
                      >
                        Approve & Fill
                      </button>
                    </>
                  ) : (
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                      r.status === "APPROVED" ? "bg-green-700 text-green-300" : "bg-red-700 text-red-300"
                    }`}>
                      {r.status}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {(activeTab === "pending" ? pendingRequests : historyRequests).length === 0 && (
              <div className="text-center py-20 opacity-50">
                <p className="text-5xl mb-4">🛸</p>
                <p className="text-gray-300 font-bold text-lg">No requests in this queue.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
