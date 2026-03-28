"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Title, Filler } from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Fuel, MapPin, BarChart3, Settings, 
  Trash2, UserPlus, Shield, CheckCircle, Search, 
  DollarSign, Activity, Zap, ExternalLink,
  LayoutDashboard, Menu, LogOut, History
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
  const [users, setUsers] = useState<User[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [requests, setRequests] = useState<FuelRequest[]>([]);
  const [searchUser, setSearchUser] = useState("");
  const [tab, setTab] = useState<Tab>("analytics");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

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
  const searchParams = useSearchParams();

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
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row overflow-hidden selection:bg-indigo-500/30">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/50 border-r border-white/5 backdrop-blur-3xl transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center gap-3 mb-10 px-2 py-4">
             <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <Shield className="w-5 h-5 text-white" />
             </div>
             <div>
                <h1 className="text-sm font-bold text-white tracking-tight leading-none">SYSTEM CONTROL</h1>
                <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-1 uppercase">Admin Terminal v2.5</p>
             </div>
          </div>
          <nav className="flex-1 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium group ${
                  tab === item.id 
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/10" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className={`${tab === item.id ? "text-indigo-400" : "group-hover:text-white"} transition-colors`}>{item.icon}</div>
                {item.label}
              </button>
            ))}
          </nav>
          <button onClick={() => router.push('/auth/logout')} className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium mt-auto">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        <div className="md:hidden flex items-center justify-between p-4 bg-slate-900/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-[40]">
           <Shield className="w-5 h-5 text-indigo-500" />
           <button title="sidebar" onClick={() => setSidebarOpen(true)} className="p-2 text-slate-400 hover:text-white"><Menu className="w-5 h-5" /></button>
        </div>

        <div className="relative z-10 p-6 sm:p-10 space-y-10">
           <AnimatePresence mode="wait">
            {tab === "users" && (
              <motion.div key="users" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3"><Users className="w-6 h-6 text-indigo-400" />Personnel Directory</h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">{filteredUsers.length} system accounts detected</p>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="text" placeholder="Search personnel..." className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" value={searchUser} onChange={e => setSearchUser(e.target.value)} />
                    </div>
                    <button onClick={() => setShowCreateUser(true)} className="px-5 py-2.5 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"><UserPlus className="w-4 h-4" /> Add Account</button>
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900/50 border-b border-white/5">
                      <tr className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Full Identity</th>
                        <th className="px-6 py-4">Email Protocol</th>
                        <th className="px-6 py-4 text-center">System Authority</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.map((u) => (
                        <tr key={u._id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xs border border-indigo-500/10">{u.name.charAt(0)}</div>
                               <span className="font-semibold text-white text-sm">{u.name}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-sm">{u.email}</td>
                          <td className="px-6 py-4 text-center">
                              <select 
                                title="Change User Role"
                                value={u.role} 
                                onChange={(e) => updateUserRole(u._id, e.target.value)} 
                                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border outline-none bg-slate-950 ${u.role === "ADMIN" ? "border-purple-500/20 text-purple-400" : u.role === "STATION" ? "border-amber-500/20 text-amber-400" : "border-emerald-500/20 text-emerald-400"}`}
                              >
                                 <option value="DRIVER">Driver</option>
                                 <option value="STATION">Station</option>
                                 <option value="ADMIN">Admin</option>
                              </select>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <button 
                               title="Delete User"
                               onClick={() => deleteUser(u._id)} 
                               className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {tab === "stations" && (
              <motion.div key="stations" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3"><Fuel className="w-6 h-6 text-emerald-400" />Fuel Grid Nodes</h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">{stations.length} distribution points synchronized</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stations.map((s) => (
                    <div key={s._id} className="group bg-slate-900/50 rounded-2xl p-6 border border-white/5 hover:border-indigo-500/20 hover:bg-slate-900/80 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors truncate">{s.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                             <MapPin className="w-3 h-3 text-slate-500" />
                             <p className="text-xs text-slate-400 font-medium truncate">{s.location}</p>
                          </div>
                        </div>
                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${s.petrol || s.diesel ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                          {s.petrol || s.diesel ? "Online" : "Static"}
                        </div>
                      </div>
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                           <span className="text-xs text-slate-500 font-medium">Benzene Flux</span>
                           <span className={`text-xs font-bold ${s.petrol ? "text-indigo-400" : "text-slate-700"}`}>{s.petrol ? "ACTIVE" : "VOID"}</span>
                        </div>
                        <div className="flex justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                           <span className="text-xs text-slate-500 font-medium">Nafta Unit</span>
                           <span className={`text-xs font-bold ${s.diesel ? "text-amber-400" : "text-slate-700"}`}>{s.diesel ? "ACTIVE" : "VOID"}</span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <Shield className={`w-3.5 h-3.5 ${s.ownerUserId ? "text-indigo-500" : "text-slate-700"}`} />
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{s.ownerUserId ? "Validated" : "Unverified"}</span>
                         </div>
                         <button className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 uppercase tracking-tight">Configure <ExternalLink className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {tab === "requests" && (
              <motion.div key="requests" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3"><Activity className="w-6 h-6 text-indigo-400" />Transaction Ledger</h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Complete platform activity logs</p>
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-900/50 border-b border-white/5">
                        <tr className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                          <th className="px-6 py-4">Orchestrator</th>
                          <th className="px-6 py-4">Node Destination</th>
                          <th className="px-6 py-4">Resource</th>
                          <th className="px-6 py-4 text-center">Protocol Status</th>
                          <th className="px-6 py-4 text-right">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {requests.map((r) => (
                          <tr key={r._id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                 <div className="w-6 h-6 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-[10px] border border-indigo-500/10">{r.driverId?.name.charAt(0)}</div>
                                 <span className="font-semibold text-white text-sm">{r.driverId?.name}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-medium text-slate-400">{r.stationId?.name}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-1 h-1 rounded-full ${r.fuelType === "petrol" ? "bg-indigo-500" : "bg-amber-500"}`} />
                                <span className="text-[10px] font-bold uppercase text-slate-300">{r.fuelType}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                               <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${r.status === "PENDING" ? "border-amber-500/20 text-amber-500" : r.status === "APPROVED" ? "border-emerald-500/20 text-emerald-500" : "border-rose-500/20 text-rose-500"}`}>{r.status}</span>
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-slate-500 text-[10px] tabular-nums">{r.createdAt ? new Date(r.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === "analytics" && (
              <motion.div key="analytics" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-12">
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "Total Users", value: stats.users, icon: <Users className="w-4 h-4" /> },
                    { label: "Fleet Drivers", value: stats.drivers, icon: <Activity className="w-4 h-4" /> },
                    { label: "Grid Nodes", value: stats.stations, icon: <Fuel className="w-4 h-4" /> },
                    { label: "Gross Data Flow", value: stats.requests, icon: <History className="w-4 h-4" /> },
                  ].map((s, i) => (
                    <div key={i} className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{s.label}</p>
                          <p className="text-2xl font-bold mt-2 text-white">{s.value.toLocaleString()}</p>
                        </div>
                        <div className="p-2 bg-white/5 rounded-lg text-slate-400">{s.icon}</div>
                      </div>
                    </div>
                  ))}
                  <div className="sm:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">Node Saturation</p>
                      <div className="space-y-3">
                         <div className="flex justify-between text-xs font-medium"><span className="text-slate-400">Operational Distribution</span><span className="text-emerald-400">{platformSignals.activeStations} Nodes</span></div>
                         <div className="flex justify-between text-xs font-medium"><span className="text-slate-400">Static Capacity</span><span className="text-slate-600">{platformSignals.idleStations} Nodes</span></div>
                      </div>
                    </div>
                    <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">Protocol Efficiency</p>
                      <div className="flex items-end justify-between"><p className="text-3xl font-bold text-white">{platformSignals.approvalRate}%</p><span className="text-[10px] font-bold text-indigo-400 uppercase">Authorization Rate</span></div>
                      <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${platformSignals.approvalRate}%` }} /></div>
                    </div>
                    <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">Unauthorized Pending</p>
                      <p className="text-3xl font-bold text-amber-500">{stats.pending}</p>
                      <p className="mt-2 text-[10px] font-medium text-slate-500 uppercase tracking-wider">Awaiting mission approval</p>
                    </div>
                  </div>
                </section>

                <div className="flex justify-between items-center pt-8 border-t border-white/5">
                  <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3"><BarChart3 className="w-6 h-6 text-indigo-400" />Performance Intelligence</h2>
                </div>

                {loadingAnalytics || !analytics ? (
                  <div className="flex flex-col items-center justify-center py-32 space-y-4"><div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" /><p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Synchronizing Intelligence...</p></div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { label: "Volumetric Flux", value: analytics.totals.litres.toLocaleString(), unit: "Liters", icon: Fuel },
                        { label: "Economic Value", value: analytics.totals.revenue.toLocaleString(), unit: "ETB", icon: DollarSign },
                        { label: "System Resolution", value: `${Math.round((analytics.totals.completed / analytics.totals.requests) * 100 || 0)}%`, icon: CheckCircle },
                        { label: "Active Transactions", value: analytics.totals.approved.toLocaleString(), icon: Zap },
                      ].map((s, i) => (
                        <div key={i} className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 shadow-sm">
                          <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-white/5 rounded-lg text-slate-400"><s.icon className="w-4 h-4" /></div><p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{s.label}</p></div>
                          <div className="flex items-baseline gap-2"><h3 className="text-2xl font-bold text-white">{s.value}</h3>{s.unit && <span className="text-[10px] font-bold text-slate-600 uppercase">{s.unit}</span>}</div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                       <div className="lg:col-span-2 bg-slate-900/50 border border-white/5 rounded-2xl p-8">
                          <h3 className="text-sm font-bold text-white uppercase tracking-tight mb-8">Demand Velocity</h3>
                          <div className="h-[350px]">
                            {requestsOverTime && requestsOverTime.labels.length > 0 && (
                              <Line data={{ labels: requestsOverTime.labels, datasets: [{ label: "Flow", data: requestsOverTime.totals, borderColor: "#6366f1", backgroundColor: "transparent", borderWidth: 2, pointRadius: 0, tension: 0.15 }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: "#475569", font: { weight: 600, size: 10 } } }, y: { grid: { color: "rgba(255,255,255,0.03)" }, ticks: { color: "#475569", font: { weight: 600, size: 10 } }, beginAtZero: true } } }} />
                            )}
                          </div>
                       </div>
                       <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-8 flex flex-col items-center">
                          <h3 className="text-sm font-bold text-white uppercase tracking-tight mb-8 w-full">Fuel Matrix</h3>
                          <div className="w-full h-56 mb-8">
                            {analytics.fuelBreakdown && analytics.fuelBreakdown.length > 0 && (
                               <Doughnut data={{ labels: analytics.fuelBreakdown.map(f => f._id.toUpperCase()), datasets: [{ data: analytics.fuelBreakdown.map(f => f.count), backgroundColor: ["#6366f1", "#f59e0b"], borderColor: "transparent", borderWidth: 0 }] }} options={{ responsive: true, maintainAspectRatio: false, cutout: '85%', plugins: { legend: { display: false } } }} />
                            )}
                          </div>
                          <div className="w-full space-y-2">
                             {analytics.fuelBreakdown.map((f, idx) => (
                                <div key={idx} className="flex justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${idx === 0 ? "bg-indigo-500" : "bg-amber-500"}`} /><span className="text-[10px] font-bold text-slate-400 uppercase">{f._id}</span></div><span className="text-xs font-bold text-white">{f.count} REQ</span></div>
                             ))}
                          </div>
                       </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {tab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto">
                 <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-8 space-y-8">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">A</div>
                       <div><h3 className="text-xl font-bold text-white">System Authority</h3><p className="text-slate-500 text-sm font-medium">Root Node Administrator</p></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Authorization Layer</p><p className="text-sm font-semibold text-white">Full Protocol Access Permission</p></div>
                       <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Interface Authority</p><p className="text-sm font-semibold text-white">Command Center V2.5 Secure</p></div>
                    </div>
                 </div>
              </motion.div>
            )}
           </AnimatePresence>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {showCreateStation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateStation(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-2">Deploy New Node</h3>
              <p className="text-slate-500 text-sm mb-8">Register a distribution point into the global fuel matrix.</p>
              <div className="space-y-6">
                <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">Node Title</label><input type="text" placeholder="e.g., Central Station Prime" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm" value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} /></div>
                <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">Coordinates / Sector</label><input type="text" placeholder="e.g., Sector 7G, Addis" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm" value={createForm.location} onChange={e => setCreateForm({...createForm, location: e.target.value})} /></div>
                <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">Officer Email (Optional)</label><input type="email" placeholder="assign.officer@fuel.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm" value={createForm.ownerEmail} onChange={e => setCreateForm({...createForm, ownerEmail: e.target.value})} /></div>
                {createError && <p className="text-xs font-bold text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{createError}</p>}
                <button onClick={handleCreateStation} disabled={createLoading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20">{createLoading ? "DEPLOYING..." : "AUTHORIZE DEPLOYMENT"}</button>
              </div>
            </motion.div>
          </div>
        )}

        {showCreateUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateUser(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-2">Commission Account</h3>
              <p className="text-slate-500 text-sm mb-8">Establish new personnel credentials for platform access.</p>
              <div className="space-y-5">
                <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Identity Name</label><input type="text" placeholder="Officer Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} /></div>
                <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Comm Channel (Email)</label><input type="email" placeholder="protocol@system.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} /></div>
                <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Access Cipher (Password)</label><input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} /></div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {["DRIVER", "STATION", "ADMIN"].map(r => (
                    <button key={r} onClick={() => setUserForm({...userForm, role: r})} className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all border ${userForm.role === r ? "bg-indigo-600 border-indigo-500 text-white" : "bg-white/5 border-white/5 text-slate-500 hover:text-white"}`}>{r}</button>
                  ))}
                </div>
                {userError && <p className="text-xs font-bold text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{userError}</p>}
                <button onClick={handleCreateUser} disabled={userLoading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 mt-4">{userLoading ? "COMMISSIONING..." : "FINALIZE COMMISSION"}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
