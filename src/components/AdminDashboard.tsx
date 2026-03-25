"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Title, Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Title, Filler
);

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
  ownerUserId?: string;
}

interface FuelRequest {
  _id: string;
  fuelType: string;
  status: string;
  driverId?: { name: string };
  stationId?: { name: string };
  createdAt?: string;
}

interface AdminAnalytics {
  byDay: { _id: { y: number; m: number; d: number; fuelType: string }; count: number; litres: number; revenue: number }[];
  fuelBreakdown: { _id: string; count: number; litres: number; revenue: number }[];
  topStations: { name: string; count: number; revenue: number; litres: number }[];
  totals: { requests: number; litres: number; revenue: number; approved: number; completed: number; pending: number };
  stationCount: number;
}

interface CreateStationForm {
  name: string;
  location: string;
  ownerEmail: string;
}

type Tab = "users" | "stations" | "requests" | "analytics";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [requests, setRequests] = useState<FuelRequest[]>([]);
  const [searchUser, setSearchUser] = useState("");
  const [tab, setTab] = useState<Tab>("users");
  const [analyticsRange, setAnalyticsRange] = useState<"7d" | "30d">("30d");
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [showCreateStation, setShowCreateStation] = useState(false);
  const [createForm, setCreateForm] = useState<CreateStationForm>({ name: "", location: "", ownerEmail: "" });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState(false);

  const loadAnalytics = useCallback(async (range: "7d" | "30d") => {
    try {
      setLoadingAnalytics(true);
      const res = await fetch(`/api/admin/analytics?range=${range}`);
      if (res.ok) setAnalytics(await res.json());
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, stationsRes, requestsRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/stations"),
          fetch("/api/admin/requests"),
        ]);
        const usersData = await usersRes.json();
        const stationsData = await stationsRes.json();
        const requestsData = await requestsRes.json();
        setUsers(Array.isArray(usersData) ? usersData : []);
        setStations(Array.isArray(stationsData) ? stationsData : []);
        setRequests(Array.isArray(requestsData) ? requestsData : []);
      } catch {
        // silent
      }
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (tab === "analytics") loadAnalytics(analyticsRange);
  }, [tab, analyticsRange, loadAnalytics]);

  const stats = {
    users: users.length,
    drivers: users.filter(u => u.role === "DRIVER").length,
    stations: stations.length,
    requests: requests.length,
    pending: requests.filter(r => r.status === "PENDING").length,
    approved: requests.filter(r => r.status === "APPROVED").length,
  };

  const platformSignals = {
    activeStations: stations.filter(s => s.petrol || s.diesel).length,
    idleStations: stations.filter(s => !s.petrol && !s.diesel).length,
    approvalRate:
      requests.length === 0
        ? 0
        : Math.round((requests.filter(r => r.status === "APPROVED").length / requests.length) * 100),
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

  const handleCreateStation = async () => {
    setCreateError("");
    if (!createForm.name.trim() || !createForm.location.trim()) {
      setCreateError("Name and location are required.");
      return;
    }
    setCreateLoading(true);
    try {
      const res = await fetch("/api/admin/stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Failed to create station");
        return;
      }
      setStations(prev => [...prev, data]);
      setCreateSuccess(true);
      setCreateForm({ name: "", location: "", ownerEmail: "" });
      setTimeout(() => { setCreateSuccess(false); setShowCreateStation(false); }, 1800);
    } catch {
      setCreateError("Network error");
    } finally {
      setCreateLoading(false);
    }
  };

  // --- Analytics chart data helpers ---
  const buildRequestsOverTime = () => {
    if (!analytics?.byDay) return null;
    const dayMap = new Map<string, { petrol: number; diesel: number; total: number }>();
    for (const d of analytics.byDay) {
      const key = `${d._id.d}/${d._id.m}`;
      const existing = dayMap.get(key) ?? { petrol: 0, diesel: 0, total: 0 };
      existing.total += d.count;
      if (d._id.fuelType === "petrol") existing.petrol += d.count;
      else existing.diesel += d.count;
      dayMap.set(key, existing);
    }
    const labels = [...dayMap.keys()];
    const totals = labels.map(k => dayMap.get(k)!.total);
    const petrolData = labels.map(k => dayMap.get(k)!.petrol);
    const dieselData = labels.map(k => dayMap.get(k)!.diesel);
    return { labels, totals, petrolData, dieselData };
  };

  const requestsOverTime = buildRequestsOverTime();

  const TABS: { id: Tab; label: string }[] = [
    { id: "users", label: "USERS" },
    { id: "stations", label: "STATIONS" },
    { id: "requests", label: "REQUESTS" },
    { id: "analytics", label: "📊 ANALYTICS" },
  ];

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
              Oversee platform users, fuel stations, and transaction records.
            </p>
          </div>
          <div className="flex bg-white/10 rounded-2xl backdrop-blur border border-white/10 overflow-hidden">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-5 py-3 text-xs font-bold transition ${tab === t.id ? "bg-white/20 text-white" : "opacity-60 hover:opacity-80"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </header>

        {/* STATS + PLATFORM OVERVIEW */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Users", value: stats.users, icon: "👥", color: "text-purple-300" },
            { label: "Drivers", value: stats.drivers, icon: "🚗", color: "text-blue-300" },
            { label: "Stations", value: stats.stations, icon: "⛽", color: "text-emerald-300" },
            { label: "Requests", value: stats.requests, icon: "📄", color: "text-orange-300" },
          ].map((s, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-purple-200 uppercase tracking-wide">{s.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                </div>
                <span className="text-3xl">{s.icon}</span>
              </div>
            </div>
          ))}

          <div className="sm:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 rounded-2xl p-4 border border-emerald-400/40">
              <p className="text-xs uppercase text-emerald-100 tracking-wide font-semibold">Active vs Idle Stations</p>
              <p className="mt-2 text-sm text-emerald-50">
                Active: <span className="font-bold text-emerald-300">{platformSignals.activeStations}</span>{" "}
                • Idle: <span className="font-bold text-red-300">{platformSignals.idleStations}</span>
              </p>
              <p className="mt-1 text-[11px] text-emerald-100/80">
                Idle stations may need onboarding, support, or pricing review.
              </p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
              <p className="text-xs uppercase text-purple-100 tracking-wide font-semibold">Request Approval Rate</p>
              <p className="mt-2 text-3xl font-extrabold text-purple-50">{platformSignals.approvalRate}%</p>
              <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
                  style={{ width: `${platformSignals.approvalRate}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-purple-100/80">Approved vs total requests.</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500/10 to-orange-900/30 rounded-2xl p-4 border border-orange-400/30">
              <p className="text-xs uppercase text-orange-100 tracking-wide font-semibold">Pending Requests</p>
              <p className="mt-2 text-3xl font-extrabold text-orange-200">{stats.pending}</p>
              <p className="mt-1 text-[11px] text-orange-100/80">
                {stats.pending > 0
                  ? "Review the Requests tab to process outstanding items."
                  : "All requests are up to date. Great work!"}
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
                placeholder="Search by name or email..."
                className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-sm"
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
                    <tr key={u._id} className="border-t border-white/10 hover:bg-white/10">
                      <td className="px-6 py-4 font-semibold">{u.name}</td>
                      <td className="px-6 py-4 text-purple-200/80">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          u.role === "ADMIN" ? "bg-purple-500/20 text-purple-300"
                          : u.role === "STATION" ? "bg-orange-500/20 text-orange-300"
                          : "bg-blue-500/20 text-blue-300"
                        }`}>{u.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => deleteUser(u._id)} className="text-red-400 hover:text-red-300 text-sm transition">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-10 text-purple-200/50">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* STATIONS TAB */}
        {tab === "stations" && (
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Fuel Stations</h2>
              <button
                onClick={() => { setShowCreateStation(true); setCreateError(""); setCreateSuccess(false); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-sm font-bold shadow-lg transition"
              >
                <span>+</span> Create Station
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stations.map(s => (
                <div key={s._id} className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:scale-[1.02] transition">
                  <h3 className="text-xl font-bold">{s.name}</h3>
                  <p className="text-purple-200 text-sm mt-1">📍 {s.location}</p>
                  {s.ownerUserId && (
                    <p className="text-xs text-purple-300/60 mt-1">Owner assigned</p>
                  )}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Petrol</span>
                      <span className={s.petrol ? "text-green-400" : "text-red-400"}>{s.petrol ? "Available" : "Empty"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Diesel</span>
                      <span className={s.diesel ? "text-green-400" : "text-red-400"}>{s.diesel ? "Available" : "Empty"}</span>
                    </div>
                  </div>
                </div>
              ))}
              {stations.length === 0 && (
                <div className="col-span-3 text-center py-16 text-purple-200/50">
                  <p className="text-4xl mb-4">⛽</p>
                  <p>No stations yet. Create one to get started.</p>
                </div>
              )}
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
                    <tr key={r._id} className="border-t border-white/10 hover:bg-white/10">
                      <td className="px-6 py-4">{r.driverId?.name}</td>
                      <td className="px-6 py-4">{r.stationId?.name}</td>
                      <td className="px-6 py-4 capitalize">{r.fuelType}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          r.status === "PENDING" ? "bg-orange-500/20 text-orange-300"
                          : r.status === "APPROVED" ? "bg-green-500/20 text-green-300"
                          : "bg-red-500/20 text-red-300"
                        }`}>{r.status}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-purple-200/70">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-10 text-purple-200/50">No requests yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ANALYTICS TAB */}
        {tab === "analytics" && (
          <section className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-3xl font-bold">Platform Analytics</h2>
              <div className="flex gap-2">
                {(["7d", "30d"] as const).map(r => (
                  <button key={r}
                    onClick={() => setAnalyticsRange(r)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${analyticsRange === r ? "bg-purple-600 text-white" : "bg-white/10 text-purple-200 hover:bg-white/20"}`}
                  >
                    {r === "7d" ? "Last 7 days" : "Last 30 days"}
                  </button>
                ))}
              </div>
            </div>

            {loadingAnalytics || !analytics ? (
              <div className="flex items-center justify-center py-24">
                <div className="text-center space-y-3">
                  <div className="w-10 h-10 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-purple-200/60 text-sm">Loading analytics…</p>
                </div>
              </div>
            ) : (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Total Requests", value: analytics.totals.requests.toLocaleString(), icon: "📄", color: "text-purple-300" },
                    { label: "Total Litres", value: `${analytics.totals.litres.toLocaleString()} L`, icon: "⛽", color: "text-blue-300" },
                    { label: "Revenue", value: `${analytics.totals.revenue.toLocaleString()} ETB`, icon: "💰", color: "text-emerald-300" },
                    { label: "Approved", value: analytics.totals.approved.toLocaleString(), icon: "✅", color: "text-green-300" },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-purple-200/70 uppercase tracking-wide">{s.label}</p>
                          <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                        </div>
                        <span className="text-2xl">{s.icon}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Requests over time */}
                {requestsOverTime && requestsOverTime.labels.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <p className="text-sm font-bold text-purple-200/80 uppercase tracking-wide mb-4">Requests Over Time</p>
                    <Line
                      data={{
                        labels: requestsOverTime.labels,
                        datasets: [
                          {
                            label: "Total",
                            data: requestsOverTime.totals,
                            borderColor: "rgba(168,85,247,0.9)",
                            backgroundColor: "rgba(168,85,247,0.1)",
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 3,
                          },
                          {
                            label: "Petrol",
                            data: requestsOverTime.petrolData,
                            borderColor: "rgba(59,130,246,0.8)",
                            backgroundColor: "transparent",
                            borderWidth: 1.5,
                            borderDash: [4, 3],
                            tension: 0.4,
                            pointRadius: 2,
                          },
                          {
                            label: "Diesel",
                            data: requestsOverTime.dieselData,
                            borderColor: "rgba(251,191,36,0.8)",
                            backgroundColor: "transparent",
                            borderWidth: 1.5,
                            borderDash: [4, 3],
                            tension: 0.4,
                            pointRadius: 2,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { labels: { color: "#c4b5fd", font: { size: 11 } } },
                          tooltip: { mode: "index", intersect: false },
                        },
                        scales: {
                          x: { ticks: { color: "#a78bfa" }, grid: { color: "#ffffff08" } },
                          y: { ticks: { color: "#a78bfa" }, grid: { color: "#ffffff08" }, beginAtZero: true },
                        },
                      }}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Fuel type breakdown */}
                  {analytics.fuelBreakdown && analytics.fuelBreakdown.length > 0 && (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                      <p className="text-sm font-bold text-purple-200/80 uppercase tracking-wide mb-6">Fuel Type Breakdown</p>
                      <div className="flex flex-col items-center gap-6">
                        <div className="w-48 h-48">
                          <Doughnut
                            data={{
                              labels: analytics.fuelBreakdown.map(f => f._id?.toUpperCase() ?? "—"),
                              datasets: [{
                                data: analytics.fuelBreakdown.map(f => f.count),
                                backgroundColor: ["rgba(59,130,246,0.75)", "rgba(251,191,36,0.75)"],
                                borderColor: ["#3b82f6", "#fbbf24"],
                                borderWidth: 2,
                                hoverOffset: 6,
                              }],
                            }}
                            options={{
                              cutout: "65%",
                              plugins: { legend: { position: "bottom", labels: { color: "#c4b5fd", padding: 16, font: { size: 11 } } } },
                            }}
                          />
                        </div>
                        <div className="w-full space-y-2">
                          {analytics.fuelBreakdown.map(f => (
                            <div key={f._id} className="flex justify-between text-sm">
                              <span className="capitalize text-purple-200">{f._id}</span>
                              <span className="font-bold">{f.count} req · {f.litres.toLocaleString()} L · {f.revenue.toLocaleString()} ETB</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Top stations */}
                  {analytics.topStations && analytics.topStations.length > 0 && (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                      <p className="text-sm font-bold text-purple-200/80 uppercase tracking-wide mb-4">Top Stations by Requests</p>
                      <Bar
                        data={{
                          labels: analytics.topStations.map(s => s.name),
                          datasets: [
                            {
                              label: "Requests",
                              data: analytics.topStations.map(s => s.count),
                              backgroundColor: "rgba(168,85,247,0.6)",
                              borderColor: "rgba(168,85,247,1)",
                              borderWidth: 1,
                              borderRadius: 6,
                            },
                            {
                              label: "Revenue (ETB)",
                              data: analytics.topStations.map(s => s.revenue),
                              backgroundColor: "rgba(16,185,129,0.5)",
                              borderColor: "rgba(16,185,129,1)",
                              borderWidth: 1,
                              borderRadius: 6,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          plugins: { legend: { labels: { color: "#c4b5fd", font: { size: 11 } } } },
                          scales: {
                            x: { ticks: { color: "#a78bfa", maxRotation: 30 }, grid: { color: "#ffffff08" } },
                            y: { ticks: { color: "#a78bfa" }, grid: { color: "#ffffff08" }, beginAtZero: true },
                          },
                        }}
                      />
                    </div>
                  )}
                </div>

                {analytics.totals.requests === 0 && (
                  <div className="text-center py-16 text-purple-200/40">
                    <p className="text-5xl mb-4">📊</p>
                    <p className="text-lg">No request data yet for this period.</p>
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </div>

      {/* CREATE STATION MODAL */}
      {showCreateStation && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !createLoading && setShowCreateStation(false)} />
          <div className="relative bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold">Create Station</h3>
                <p className="text-sm text-purple-200/60 mt-0.5">Add a new fuel station to the platform</p>
              </div>
              <button onClick={() => setShowCreateStation(false)} className="p-2 hover:bg-white/10 rounded-full transition text-white/60 hover:text-white">✕</button>
            </div>

            {createSuccess ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center text-3xl">✓</div>
                <p className="text-emerald-300 font-bold">Station created successfully!</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {[
                    { id: "cs-name", label: "Station Name *", placeholder: "e.g. Total Bole", key: "name" as const },
                    { id: "cs-loc", label: "Location *", placeholder: "e.g. Addis Ababa, Ethiopia", key: "location" as const },
                    { id: "cs-email", label: "Assign to STATION user (email, optional)", placeholder: "station@example.com", key: "ownerEmail" as const },
                  ].map(field => (
                    <div key={field.id}>
                      <label htmlFor={field.id} className="block text-xs font-bold uppercase tracking-wide text-purple-200/60 mb-1.5">{field.label}</label>
                      <input
                        id={field.id}
                        type={field.key === "ownerEmail" ? "email" : "text"}
                        value={createForm[field.key]}
                        onChange={e => setCreateForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-purple-500 transition"
                      />
                    </div>
                  ))}
                </div>

                {createError && (
                  <div className="px-4 py-3 bg-red-500/15 border border-red-400/30 rounded-xl text-red-300 text-sm">
                    {createError}
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button onClick={() => setShowCreateStation(false)} className="flex-1 py-3 rounded-xl bg-white/10 text-sm font-bold hover:bg-white/20 transition">Cancel</button>
                  <button
                    onClick={handleCreateStation}
                    disabled={createLoading}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-sm font-bold shadow-lg transition disabled:opacity-50"
                  >
                    {createLoading ? "Creating…" : "Create Station"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
