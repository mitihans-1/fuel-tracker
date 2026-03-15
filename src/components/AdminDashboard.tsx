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

interface FuelRequest {
  _id: string;
  fuelType: string;
  status: string;
  driverId?: { name: string };
  stationId?: { name: string };
  createdAt?: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [requests, setRequests] = useState<FuelRequest[]>([]);
  const [searchUser, setSearchUser] = useState("");
  const [tab, setTab] = useState<"users" | "stations" | "requests">("users");

  useEffect(() => {
    const load = async () => {
      const [usersRes, stationsRes, requestsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/stations"),
        fetch("/api/request/station"),
      ]);
      setUsers(await usersRes.json());
      setStations(await stationsRes.json());
      setRequests(await requestsRes.json());
    };

    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    users: users.length,
    drivers: users.filter(u => u.role === "DRIVER").length,
    stations: stations.length,
    requests: requests.length,
    pending: requests.filter(r => r.status === "PENDING").length,
    approved: requests.filter(r => r.status === "APPROVED").length
  };

  const platformSignals = {
    activeStations: stations.filter(s => s.petrol || s.diesel).length,
    idleStations: stations.filter(s => !s.petrol && !s.diesel).length,
    approvalRate:
      requests.length === 0
        ? 0
        : Math.round(
            (requests.filter(r => r.status === "APPROVED").length / requests.length) * 100
          ),
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    await fetch(`/api/admin/delete?id=${id}`, { method: "DELETE" });
    setUsers(prev => prev.filter(u => u._id !== id));
  };

  const filteredUsers = users.filter(
    u =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-purple-200/70 mt-2">
              Manage users, stations and fuel requests.
            </p>
          </div>

          <div className="flex bg-white/10 rounded-2xl backdrop-blur border border-white/10 overflow-hidden">
            {["users", "stations", "requests"].map(t => (
              <button
                key={t}
                onClick={() => setTab(t as "users" | "stations" | "requests")}
                className={`px-6 py-3 text-sm font-bold transition ${
                  tab === t ? "bg-white/20" : "opacity-60"
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        {/* STATS + PLATFORM OVERVIEW */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Users", value: stats.users, icon: "👥" },
            { label: "Drivers", value: stats.drivers, icon: "🚗" },
            { label: "Stations", value: stats.stations, icon: "⛽" },
            { label: "Requests", value: stats.requests, icon: "📄" }
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-purple-200 uppercase">{s.label}</p>
                  <p className="text-3xl font-bold">{s.value}</p>
                </div>
                <span className="text-3xl">{s.icon}</span>
              </div>
            </div>
          ))}
          <div className="sm:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 rounded-2xl p-4 border border-emerald-400/40">
              <p className="text-xs uppercase text-emerald-100 tracking-wide font-semibold">
                Active vs Idle Stations
              </p>
              <p className="mt-2 text-sm text-emerald-50">
                Active: <span className="font-bold">{platformSignals.activeStations}</span> • Idle:{" "}
                <span className="font-bold">{platformSignals.idleStations}</span>
              </p>
              <p className="mt-1 text-[11px] text-emerald-100/80">
                Idle stations may need onboarding, support, or pricing review.
              </p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
              <p className="text-xs uppercase text-purple-100 tracking-wide font-semibold">
                Request Approval Rate
              </p>
              <p className="mt-2 text-3xl font-extrabold text-purple-50">
                {platformSignals.approvalRate}%
              </p>
              <p className="mt-1 text-[11px] text-purple-100/80">
                Approved vs total requests across the platform.
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-blue-400/40">
              <p className="text-xs uppercase text-blue-100 tracking-wide font-semibold">
                Billing & Plans (Preview)
              </p>
              <p className="mt-2 text-sm text-blue-50">
                Connect your billing provider to enable per‑station or per‑fleet subscriptions.
              </p>
              <p className="mt-1 text-[11px] text-blue-100/80">
                This area will surface MRR, churn, and plan breakdown once payment is wired up.
              </p>
            </div>
          </div>
        </section>

        {/* USERS TAB */}
        {tab === "users" && (
          <section className="space-y-6">

            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">User Management</h2>

              <input
                type="text"
                placeholder="Search users..."
                className="px-4 py-2 rounded-xl bg-white/10 border border-white/20"
                value={searchUser}
                onChange={e => setSearchUser(e.target.value)}
              />
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-x-auto border border-white/10">
              <table className="min-w-[600px] w-full">
                <thead className="text-purple-200 text-sm">
                  <tr>
                    <th className="px-6 py-4 text-left">Name</th>
                    <th className="px-6 py-4 text-left">Email</th>
                    <th className="px-6 py-4 text-left">Role</th>
                    <th className="px-6 py-4 text-left">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map(u => (
                    <tr
                      key={u._id}
                      className="border-t border-white/10 hover:bg-white/10"
                    >
                      <td className="px-6 py-4 font-semibold">{u.name}</td>
                      <td className="px-6 py-4">{u.email}</td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            u.role === "ADMIN"
                              ? "bg-purple-500/20 text-purple-300"
                              : u.role === "STATION"
                              ? "bg-orange-500/20 text-orange-300"
                              : "bg-blue-500/20 text-blue-300"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteUser(u._id)}
                          className="text-red-400 hover:text-red-500"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </section>
        )}

        {/* STATIONS TAB */}
        {tab === "stations" && (
          <section className="space-y-6">
            <h2 className="text-3xl font-bold">Fuel Stations</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stations.map(s => (
                <div
                  key={s._id}
                  className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:scale-[1.03] transition"
                >
                  <h3 className="text-xl font-bold">{s.name}</h3>
                  <p className="text-purple-200 text-sm mt-1">📍 {s.location}</p>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Petrol</span>
                      <span
                        className={
                          s.petrol ? "text-green-400" : "text-red-400"
                        }
                      >
                        {s.petrol ? "Available" : "Empty"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Diesel</span>
                      <span
                        className={
                          s.diesel ? "text-green-400" : "text-red-400"
                        }
                      >
                        {s.diesel ? "Available" : "Empty"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* REQUESTS TAB */}
        {tab === "requests" && (
          <section className="space-y-6">

            <h2 className="text-3xl font-bold">Fuel Requests</h2>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 overflow-x-auto">
              <table className="min-w-[600px] w-full">
                <thead className="text-purple-200 text-sm">
                  <tr>
                    <th className="px-6 py-4 text-left">Driver</th>
                    <th className="px-6 py-4 text-left">Station</th>
                    <th className="px-6 py-4 text-left">Fuel</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {requests.map(r => (
                    <tr
                      key={r._id}
                      className="border-t border-white/10 hover:bg-white/10"
                    >
                      <td className="px-6 py-4">{r.driverId?.name}</td>
                      <td className="px-6 py-4">{r.stationId?.name}</td>
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

                      <td className="px-6 py-4 text-sm">
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </section>
        )}
      </div>
    </div>
  );
}