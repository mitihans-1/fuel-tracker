"use client";

import { useEffect, useState } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Station {
  _id: string;
  name: string;
  location: string;
  petrol: boolean;
  diesel: boolean;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "stations">("users");

  useEffect(() => {
    // Fetch users
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => setUsers(data));

    // Fetch stations
    fetch("/api/admin/stations")
      .then(res => res.json())
      .then(data => setStations(data))
      .catch(() => {
        // Fallback for demo if API not fully ready
        console.warn("Stations API not ready");
      });
  }, []);

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(`/api/admin/delete?id=${id}`, { method: "DELETE" });
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    drivers: users.filter(u => u.role === "DRIVER").length,
    stations: users.filter(u => u.role === "STATION").length,
    admins: users.filter(u => u.role === "ADMIN").length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-gray-800">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight">System Admin</h1>
          <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest opacity-70">Infrastructure Control Center</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
          <button 
            onClick={() => setActiveTab("users")}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'users' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
          >
            User Management
          </button>
          <button 
            onClick={() => setActiveTab("stations")}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'stations' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
          >
            Station Assets
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Accounts", val: stats.totalUsers, color: "blue", icon: "👥" },
          { label: "Active Drivers", val: stats.drivers, color: "emerald", icon: "🚗" },
          { label: "Fuel Stations", val: stats.stations, color: "orange", icon: "⛽" },
          { label: "Staff Admins", val: stats.admins, color: "purple", icon: "🛡️" },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
              <h3 className="text-3xl font-black tracking-tighter">{item.val}</h3>
            </div>
            <div className={`w-12 h-12 rounded-2xl bg-${item.color}-50 flex items-center justify-center text-2xl`}>
              {item.icon}
            </div>
          </div>
        ))}
      </section>

      {activeTab === "users" ? (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold">User Directory</h2>
            <div className="relative w-full sm:w-80">
              <input 
                type="text"
                placeholder="Search user email or name..." 
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              <span className="absolute left-4 top-3.5 opacity-30">🔍</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">
                  <th className="px-6 py-5">Profile</th>
                  <th className="px-6 py-5">System Role</th>
                  <th className="px-6 py-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(u => (
                  <tr key={u._id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-200 to-gray-100 flex items-center justify-center font-bold text-xs uppercase">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                        u.role === 'ADMIN' ? 'border-purple-200 text-purple-600 bg-purple-50' : 
                        u.role === 'STATION' ? 'border-orange-200 text-orange-600 bg-orange-50' : 
                        'border-blue-200 text-blue-600 bg-blue-50'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteUser(u._id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Remove User"
                      >
                         🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Station Assets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stations.map(s => (
              <div key={s._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg">{s.name}</h3>
                   <span className="text-xs px-2 py-1 bg-gray-100 rounded-lg opacity-60">ID: {s._id.slice(-4)}</span>
                </div>
                <p className="text-gray-500 text-sm mb-6 flex items-center gap-2">📍 {s.location}</p>
                
                <div className="flex gap-4 border-t border-gray-50 pt-4">
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-black opacity-30">Petrol</p>
                    <p className={`text-sm font-bold ${s.petrol ? 'text-green-500' : 'text-red-500'}`}>{s.petrol ? 'Available' : 'Empty'}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-black opacity-30">Diesel</p>
                    <p className={`text-sm font-bold ${s.diesel ? 'text-green-500' : 'text-red-500'}`}>{s.diesel ? 'Available' : 'Empty'}</p>
                  </div>
                </div>
              </div>
            ))}
            {stations.length === 0 && (
              <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                <p className="text-gray-400 font-medium">No stations registered in the fleet yet.</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}