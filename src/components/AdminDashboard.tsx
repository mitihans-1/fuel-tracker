"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Title, Filler } from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
import SettingsPage from "@/app/dashboard/settings/page"; // reuse your file
import { 
  Users, Fuel, MapPin, BarChart3, Settings, 
  Trash2, UserPlus, Shield, CheckCircle, Search, 
  DollarSign, Activity, Zap, ExternalLink,
  LayoutDashboard, Menu, LogOut, History, X
} from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Title, Filler);

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

type Tab = "users" | "stations" | "requests" | "analytics" | "settings";

export default function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [requests, setRequests] = useState<FuelRequest[]>([]);
  const [searchUser, setSearchUser] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const tab = (searchParams.get("tab") as Tab) || "analytics";

  const sidebarItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "analytics", label: "Overview", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "users", label: "Users", icon: <Users className="w-5 h-5" /> },
    { id: "stations", label: "Stations", icon: <MapPin className="w-5 h-5" /> },
    { id: "requests", label: "Requests", icon: <History className="w-5 h-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];
  
  const [analyticsRange] = useState<"7d" | "30d">("30d");
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [showCreateStation, setShowCreateStation] = useState(false);
  const [createForm, setCreateForm] = useState<CreateStationForm>({ name: "", location: "", ownerEmail: "" });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "DRIVER" });
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState("");

  const setTab = (t: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", t);
    router.push(`${window.location.pathname}?${params.toString()}`);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "register") {
      setShowCreateStation(true);
      setTab("stations");
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

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
      } catch { /* silent */ }
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
    approvalRate: requests.length === 0 ? 0 : Math.round((requests.filter(r => r.status === "APPROVED").length / requests.length) * 100),
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    await fetch(`/api/admin/delete?id=${id}`, { method: "DELETE" });
    setUsers(prev => prev.filter(u => u._id !== id));
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchUser.toLowerCase()) || u.email.toLowerCase().includes(searchUser.toLowerCase()));

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
      if (!res.ok) { setCreateError(data.error || "Failed to create station"); return; }
      setStations(prev => [...prev, data]);
      setCreateForm({ name: "", location: "", ownerEmail: "" });
      setTimeout(() => { setShowCreateStation(false); }, 1800);
    } catch { setCreateError("Network error"); } finally { setCreateLoading(false); }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      if (res.ok) setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u));
    } catch (err) { console.error("Update role failed:", err); }
  };

  const handleCreateUser = async () => {
    setUserError("");
    if(!userForm.email || !userForm.password || !userForm.name) { setUserError("All fields are required"); return; }
    setUserLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });
      const data = await res.json();
      if (!res.ok) { setUserError(data.error || "Failed to create user"); return; }
      setUsers(prev => [...prev, data]);
      setUserForm({ name: "", email: "", password: "", role: "DRIVER" });
      setTimeout(() => { setShowCreateUser(false); }, 1500);
    } catch { setUserError("Network error"); } finally { setUserLoading(false); }
  };

  const buildRequestsOverTime = () => {
    if (!analytics?.byDay) return null;
    const dayMap = new Map<string, { total: number }>();
    for (const d of analytics.byDay) {
      const key = `${d._id.d}/${d._id.m}`;
      const existing = dayMap.get(key) ?? { total: 0 };
      existing.total += d.count;
      dayMap.set(key, existing);
    }
    const labels = [...dayMap.keys()];
    const totals = labels.map(k => dayMap.get(k)!.total);
    return { labels, totals };
  };

  const requestsOverTime = buildRequestsOverTime();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
        title="mobile"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-semibold text-gray-900">FuelAdmin</h1>
            <button
            title="mobile"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
               onClick={() => setTab(item.id)}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-all ${
                  tab === item.id
                    ? "bg-indigo-50 text-indigo-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
          <AnimatePresence mode="wait">
            {tab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Users</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage platform users and their roles</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="relative flex-1 sm:w-80">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={searchUser}
                        onChange={e => setSearchUser(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={() => setShowCreateUser(true)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add User
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <th className="px-6 py-3">Name</th>
                          <th className="px-6 py-3">Email</th>
                          <th className="px-6 py-3">Role</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map((u) => (
                          <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                  <span className="text-indigo-600 text-sm font-medium">{u.name.charAt(0)}</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{u.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                            <td className="px-6 py-4">
                              <select
                              title="update"
                                value={u.role}
                                onChange={(e) => updateUserRole(u._id, e.target.value)}
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                  u.role === "ADMIN"
                                    ? "border-purple-200 bg-purple-50 text-purple-700"
                                    : u.role === "STATION"
                                    ? "border-amber-200 bg-amber-50 text-amber-700"
                                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                                }`}
                              >
                                <option value="DRIVER">Driver</option>
                                <option value="STATION">Station</option>
                                <option value="ADMIN">Admin</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                              title="delete"
                                onClick={() => deleteUser(u._id)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === "stations" && (
              <motion.div
                key="stations"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Stations</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage fuel stations and their status</p>
                  </div>
                  <button
                    onClick={() => setShowCreateStation(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Station
                  </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stations.map((s) => (
                    <div key={s._id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{s.name}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <p className="text-xs text-gray-500">{s.location}</p>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          s.petrol || s.diesel
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {s.petrol || s.diesel ? "Active" : "Inactive"}
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-xs text-gray-500">Petrol</span>
                          <span className={`text-xs font-medium ${s.petrol ? "text-emerald-600" : "text-gray-400"}`}>
                            {s.petrol ? "Available" : "Unavailable"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-xs text-gray-500">Diesel</span>
                          <span className={`text-xs font-medium ${s.diesel ? "text-emerald-600" : "text-gray-400"}`}>
                            {s.diesel ? "Available" : "Unavailable"}
                          </span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {s.ownerUserId ? "Verified" : "Unverified"}
                          </span>
                        </div>
                        <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                          Configure
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {tab === "requests" && (
              <motion.div
                key="requests"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Fuel Requests</h2>
                  <p className="text-sm text-gray-500 mt-1">Monitor and manage fuel requests</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <th className="px-6 py-3">Driver</th>
                          <th className="px-6 py-3">Station</th>
                          <th className="px-6 py-3">Fuel Type</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {requests.map((r) => (
                          <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-gray-900">{r.driverId?.name || "N/A"}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{r.stationId?.name || "N/A"}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                                r.fuelType === "petrol" ? "text-indigo-600" : "text-amber-600"
                              }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  r.fuelType === "petrol" ? "bg-indigo-500" : "bg-amber-500"
                                }`} />
                                {r.fuelType}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                r.status === "PENDING"
                                  ? "bg-yellow-50 text-yellow-700"
                                  : r.status === "APPROVED"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-red-50 text-red-700"
                              }`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Analytics Overview</h2>
                  <p className="text-sm text-gray-500 mt-1">Platform performance metrics and insights</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "Total Users", value: stats.users, icon: Users, color: "bg-indigo-50 text-indigo-600" },
                    { label: "Drivers", value: stats.drivers, icon: Activity, color: "bg-emerald-50 text-emerald-600" },
                    { label: "Stations", value: stats.stations, icon: Fuel, color: "bg-amber-50 text-amber-600" },
                    { label: "Total Requests", value: stats.requests, icon: History, color: "bg-purple-50 text-purple-600" },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 rounded-lg ${s.color}`}>
                          <s.icon className="w-5 h-5" />
                        </div>
                      </div>
                      <p className="text-2xl font-semibold text-gray-900">{s.value.toLocaleString()}</p>
                      <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Station Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Active Stations</span>
                        <span className="font-medium text-gray-900">{platformSignals.activeStations}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Inactive Stations</span>
                        <span className="font-medium text-gray-900">{platformSignals.idleStations}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Approval Rate</h3>
                    <div>
                      <p className="text-3xl font-semibold text-gray-900">{platformSignals.approvalRate}%</p>
                      <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all"
                          style={{ width: `${platformSignals.approvalRate}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Pending Requests</h3>
                    <p className="text-3xl font-semibold text-amber-600">{stats.pending}</p>
                    <p className="text-sm text-gray-500 mt-2">Awaiting approval</p>
                  </div>
                </div>

                {/* Charts Section */}
                {loadingAnalytics || !analytics ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-sm font-medium text-gray-900 mb-6">Requests Over Time</h3>
                      <div className="h-80">
                        {requestsOverTime && requestsOverTime.labels.length > 0 && (
                          <Line
                            data={{
                              labels: requestsOverTime.labels,
                              datasets: [{
                                label: "Requests",
                                data: requestsOverTime.totals,
                                borderColor: "#6366f1",
                                backgroundColor: "transparent",
                                borderWidth: 2,
                                pointRadius: 0,
                                tension: 0.4,
                              }]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { display: false },
                                tooltip: { backgroundColor: "#1f2937" }
                              },
                              scales: {
                                x: { grid: { display: false }, ticks: { color: "#6b7280" } },
                                y: { grid: { color: "#e5e7eb" }, ticks: { color: "#6b7280" }, beginAtZero: true }
                              }
                            }}
                          />
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-sm font-medium text-gray-900 mb-6">Fuel Type Distribution</h3>
                      <div className="h-48 mb-6">
                        {analytics.fuelBreakdown && analytics.fuelBreakdown.length > 0 && (
                          <Doughnut
                            data={{
                              labels: analytics.fuelBreakdown.map(f => f._id.toUpperCase()),
                              datasets: [{
                                data: analytics.fuelBreakdown.map(f => f.count),
                                backgroundColor: ["#6366f1", "#f59e0b"],
                                borderWidth: 0,
                              }]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              cutout: "70%",
                              plugins: { legend: { display: false } }
                            }}
                          />
                        )}
                      </div>
                      <div className="space-y-3">
                        {analytics.fuelBreakdown.map((f, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${idx === 0 ? "bg-indigo-500" : "bg-amber-500"}`} />
                              <span className="text-sm font-medium text-gray-700">{f._id}</span>
                            </div>
                            <span className="text-sm text-gray-600">{f.count} requests</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
            {tab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl mx-auto space-y-12"
              >
                <SettingsPage />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showCreateStation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateStation(false)}
              className="absolute inset-0 bg-black/50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Station</h3>
              <p className="text-sm text-gray-500 mb-6">Register a new fuel station</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Station Name</label>
                  <input
                  title="name"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={createForm.name}
                    onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                  <input
                  title="location"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={createForm.location}
                    onChange={e => setCreateForm({ ...createForm, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Owner Email (Optional)</label>
                  <input
                  title="email"
                    type="email"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={createForm.ownerEmail}
                    onChange={e => setCreateForm({ ...createForm, ownerEmail: e.target.value })}
                  />
                </div>
                {createError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{createError}</p>
                )}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowCreateStation(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateStation}
                    disabled={createLoading}
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                  >
                    {createLoading ? "Adding..." : "Add Station"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showCreateUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateUser(false)}
              className="absolute inset-0 bg-black/50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Add User</h3>
              <p className="text-sm text-gray-500 mb-6">Create a new platform user</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                  <input
                  title="name"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={userForm.name}
                    onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input
                  title="email"
                    type="email"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={userForm.email}
                    onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                  <input
                  title="password"
                    type="password"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={userForm.password}
                    onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["DRIVER", "STATION", "ADMIN"].map(r => (
                      <button
                        key={r}
                        onClick={() => setUserForm({ ...userForm, role: r })}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          userForm.role === r
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                {userError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{userError}</p>
                )}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowCreateUser(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateUser}
                    disabled={userLoading}
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                  >
                    {userLoading ? "Adding..." : "Add User"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}