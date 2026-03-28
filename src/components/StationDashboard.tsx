"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { formatDateTime } from "@/lib/utils";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend, Title,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, Fuel, DollarSign,
  Clock, CheckCircle, XCircle, BarChart3,
  Download, Plus, ChevronDown, Calendar,
  MapPin, Building2, Users, Activity
} from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

type Toast = { id: number; message: string; type: "success" | "error" | "info" };
interface FuelRequest {
  _id: string;
  driverId: { name: string };
  fuelType: string;
  status: string;
  createdAt?: string;
}

interface StationData {
  _id: string;
  name: string;
  location: string;
  petrol: boolean;
  petrolQty?: number;
  petrolPrice?: number;
  diesel: boolean;
  dieselQty?: number;
  dieselPrice?: number;
}

export default function StationDashboard() {
  const [myStations, setMyStations] = useState<StationData[]>([]);
  const [activeStationId, setActiveStationId] = useState<string | null>(null);
  const [showAddStation, setShowAddStation] = useState(false);
  const [stationForm, setStationForm] = useState({ name: '', location: '' });
  const [stationRegisterLoading, setStationRegisterLoading] = useState(false);

  const [petrol, setPetrol] = useState(true);
  const [petrolQty, setPetrolQty] = useState(0);
  const [petrolPrice, setPetrolPrice] = useState(80);
  const [diesel, setDiesel] = useState(true);
  const [dieselQty, setDieselQty] = useState(0);
  const [dieselPrice, setDieselPrice] = useState(75);
  const [requests, setRequests] = useState<FuelRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "history" | "analytics">("pending");
  const [analyticsRange, setAnalyticsRange] = useState<"today" | "7d" | "30d">("7d");
  const [analytics, setAnalytics] = useState<{
    totals: { totalLitres: number; totalRevenue: number; count: number };
    byDay: { _id: { y: number; m: number; d: number }; litres: number; revenue: number }[];
    byFuel: { _id: string; litres: number; revenue: number }[];
    byHour: { _id: number; count: number }[];
  } | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [priceHistory, setPriceHistory] = useState<{ _id: string; fuelType: string; price: number; createdAt: string }[]>([]);
  const [loadingPriceHistory, setLoadingPriceHistory] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const searchParams = useSearchParams();
  const toastIdRef = useRef(0);

  // Tactical parameter observation
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "register") {
      setShowAddStation(true);
      // Clear parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  const showToast = useCallback((msg: string | { error?: string; message?: string } | unknown, type: Toast["type"] = "info") => {
    const id = ++toastIdRef.current;
    let message = "";
    
    if (typeof msg === 'string') {
      message = msg;
    } else if (msg && typeof msg === 'object') {
      message = (msg as { error?: string }).error || (msg as { message?: string }).message || JSON.stringify(msg);
    } else {
      message = String(msg);
    }
    
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const handleRegisterStation = async (e: React.FormEvent) => {
    e.preventDefault();
    setStationRegisterLoading(true);
    try {
      const res = await fetch("/api/stations/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stationName: stationForm.name, stationLocation: stationForm.location })
      });
      if (!res.ok) throw new Error(await res.text());
      showToast("Station registered! Reloading dashboard...", "success");
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      showToast("Failed to register station", "error");
    } finally {
      setStationRegisterLoading(false);
    }
  };

  const refreshData = useCallback(async () => {
    try {
      const statusRes = await fetch("/api/stations/me");
      if (statusRes.ok) {
        const data = await statusRes.json();
        if (Array.isArray(data) && data.length > 0) {
          setMyStations(data);
          const currentStation = activeStationId
            ? data.find(s => s._id === activeStationId)
            : data[0];
          if (currentStation) {
            if (!activeStationId) setActiveStationId(currentStation._id);
            setPetrol(!!currentStation.petrol);
            setPetrolQty(currentStation.petrolQty ?? 0);
            setPetrolPrice(currentStation.petrolPrice ?? 80);
            setDiesel(!!currentStation.diesel);
            setDieselQty(currentStation.dieselQty ?? 0);
            setDieselPrice(currentStation.dieselPrice ?? 75);
          }
        }
      }
      let reqUrl = "/api/request/station";
      if (activeStationId) reqUrl += `?stationId=${activeStationId}`;
      const reqRes = await fetch(reqUrl);
      const reqData = await reqRes.json();
      if (Array.isArray(reqData)) {
        setRequests(reqData);
      } else {
        setRequests([]);
      }
    } catch {
      // silent
    }
  }, [activeStationId]);

  const loadAnalytics = useCallback(async (range: "today" | "7d" | "30d" = "7d") => {
    try {
      setLoadingAnalytics(true);
      let url = `/api/stations/me/analytics?range=${range}`;
      if (activeStationId) url += `&stationId=${activeStationId}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      setAnalytics(data);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [activeStationId]);

  const loadPriceHistory = useCallback(async () => {
    try {
      setLoadingPriceHistory(true);
      let url = "/api/stations/me/price-history";
      if (activeStationId) url += `?stationId=${activeStationId}`;
      const res = await fetch(url);
      if (res.ok) setPriceHistory(await res.json());
    } finally {
      setLoadingPriceHistory(false);
    }
  }, [activeStationId]);

  const exportCSV = () => {
    if (!analytics) return;
    const rows = [
      ["Date", "Litres", "Revenue (ETB)"],
      ...analytics.byDay.map(d => [
        `${d._id.d}/${d._id.m}/${d._id.y}`,
        String(d.litres),
        String(d.revenue),
      ]),
      [],
      ["Fuel Type", "Litres", "Revenue (ETB)"],
      ...analytics.byFuel.map(f => [f._id, String(f.litres), String(f.revenue)]),
      [],
      ["Summary", "", ""],
      ["Total Litres", String(analytics.totals.totalLitres), ""],
      ["Total Revenue", String(analytics.totals.totalRevenue), "ETB"],
      ["Total Requests", String(analytics.totals.count), ""],
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `station-analytics-${analyticsRange}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV exported!", "success");
  };

  useEffect(() => {
    loadAnalytics(analyticsRange);
  }, [loadAnalytics, analyticsRange, activeStationId]);

  useEffect(() => {
    if (activeTab === "analytics") loadPriceHistory();
  }, [activeTab, loadPriceHistory]);

  useEffect(() => {
    const init = async () => {
      await refreshData();
    };
    init();
    const interval = setInterval(async () => {
      try {
        let reqUrl = "/api/request/station";
        if (activeStationId) reqUrl += `?stationId=${activeStationId}`;
        const reqRes = await fetch(reqUrl);
        const reqData = await reqRes.json();
        if (Array.isArray(reqData)) {
          setRequests(reqData);
        } else {
          setRequests([]);
        }
      } catch {
        // silent
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshData]);

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
    } catch {
      // no-op
    }
  };

  const removeRequest = async (id: string) => {
    if (!id) return;
    if (!confirm("Delete this request record permanently?")) return;
    try {
      const res = await fetch("/api/request/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id }),
      });
      if (res.ok) {
        setRequests(prev => prev.filter(r => r._id !== id));
        showToast("Record deleted successfully.", "success");
      } else {
        showToast("Failed to delete record.", "error");
      }
    } catch {
      showToast("An error occurred while deleting the record.", "error");
    }
  };

  const safeRequests = Array.isArray(requests) ? requests : [];
  const pendingRequests = safeRequests.filter(r => r.status === "PENDING");
  const historyRequests = safeRequests.filter(r => r.status !== "PENDING");

  const stats = {
    pending: pendingRequests.length,
    approvedToday: requests.filter(r => r.status === "APPROVED").length,
    rejectedToday: requests.filter(r => r.status === "REJECTED").length,
  };

  const throughput = {
    todayApproved: stats.approvedToday,
    todayRejected: stats.rejectedToday,
    queueSize: stats.pending,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200 font-sans">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium">
              <Activity className="w-4 h-4" />
              <span>Live Operations Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
              Station Control Center
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Manage fuel inventory, process driver requests, and track performance metrics in real-time.
            </p>
          </div>

          {/* Register control transitioned to Global Navbar */}
        </motion.div>

        {/* Station Selector Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 p-6 shadow-2xl"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              {myStations.length > 0 ? (
                <div>
                  <div className="relative group">
                    <select
                      title="Select Active Station"
                      className="bg-transparent text-2xl font-black outline-none cursor-pointer appearance-none pr-10 text-white hover:text-indigo-300 transition-colors"
                      value={activeStationId || ""}
                      onChange={(e) => {
                        setActiveStationId(e.target.value);
                        setTimeout(() => refreshData(), 50);
                      }}
                    >
                      {myStations.map((station) => (
                        <option key={station._id} value={station._id} className="bg-slate-950 text-base font-normal">
                          {station.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform pointer-events-none" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <p className="text-sm text-slate-400 font-medium tracking-tight">
                      {myStations.find(s => s._id === activeStationId)?.location || "Global View"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">No stations registered.</p>
              )}
            </div>
            
            <div className="flex gap-4">
               <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">System Online</span>
               </div>
               <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-bold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
               </div>
            </div>
          </div>
        </motion.div>

        {/* FUEL INVENTORY CONTROLS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
           {/* Petrol Card */}
           <motion.div 
            whileHover={{ scale: 1.01 }}
            className={`relative overflow-hidden rounded-[2.5rem] p-8 border transition-all duration-500 ${
              petrol ? "bg-indigo-600/10 border-indigo-500/30" : "bg-slate-900/50 border-white/5 opacity-80"
            }`}
           >
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
              
              <div className="relative space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-wider">Benzene (Petrol)</h3>
                    <p className="text-sm text-indigo-300/60 font-medium">Main supply line</p>
                  </div>
                  <button 
                    onClick={async () => {
                      const newStatus = !petrol;
                      setPetrol(newStatus);
                      await fetch("/api/stations/update", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ stationId: activeStationId, petrol: newStatus })
                      });
                      showToast(`Petrol ${newStatus ? "Available" : "Empty"}`, newStatus ? "success" : "info");
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    petrol ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" : "bg-white/5 text-white/40 border border-white/10"
                  }`}>
                    {petrol ? "Available ✓" : "Out of Stock ✕"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-black/20 p-5 rounded-3xl border border-white/5">
                      <p className="text-[10px] font-bold text-indigo-300/50 uppercase tracking-widest mb-1">Current Price</p>
                      <div className="flex items-center gap-2">
                        <input 
                          title="Petrol Price"
                          type="number"
                          value={petrolPrice}
                          onChange={(e) => setPetrolPrice(Number(e.target.value))}
                          onBlur={async () => {
                             await fetch("/api/stations/update", {
                               method: "PUT",
                               headers: { "Content-Type": "application/json" },
                               body: JSON.stringify({ stationId: activeStationId, petrolPrice })
                             });
                             showToast("Petrol price updated", "success");
                          }}
                          className="bg-transparent text-2xl font-black text-white w-20 outline-none"
                        />
                        <span className="text-sm font-bold text-indigo-400">ETB/L</span>
                      </div>
                   </div>
                   <div className="bg-black/20 p-5 rounded-3xl border border-white/5">
                      <p className="text-[10px] font-bold text-indigo-300/50 uppercase tracking-widest mb-1">Stock Level</p>
                      <div className="flex items-center gap-2">
                         <p className="text-2xl font-black text-white">{petrolQty.toLocaleString()}</p>
                         <span className="text-sm font-bold text-indigo-400">Litres</span>
                      </div>
                   </div>
                </div>

                <div className="flex gap-3">
                   <button 
                    onClick={() => {
                      const amount = Number(prompt("Add Petrol (Litres):", "1000"));
                      if (amount) {
                         const newQty = petrolQty + amount;
                         setPetrolQty(newQty);
                         fetch("/api/stations/update", {
                           method: "PUT",
                           headers: { "Content-Type": "application/json" },
                           body: JSON.stringify({ stationId: activeStationId, petrolQty: newQty })
                         });
                         showToast(`Added ${amount}L of Petrol`, "success");
                      }
                    }}
                    className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-widest transition-all"
                   >
                     + Add Stock
                   </button>
                </div>
              </div>
           </motion.div>

           {/* Diesel Card */}
           <motion.div 
            whileHover={{ scale: 1.01 }}
            className={`relative overflow-hidden rounded-[2.5rem] p-8 border transition-all duration-500 ${
              diesel ? "bg-amber-600/10 border-amber-500/30" : "bg-slate-900/50 border-white/5 opacity-80"
            }`}
           >
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full" />
              
              <div className="relative space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-wider">Nafta (Diesel)</h3>
                    <p className="text-sm text-amber-300/60 font-medium">Commercial fuel</p>
                  </div>
                  <button 
                    onClick={async () => {
                      const newStatus = !diesel;
                      setDiesel(newStatus);
                      await fetch("/api/stations/update", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ stationId: activeStationId, diesel: newStatus })
                      });
                      showToast(`Diesel ${newStatus ? "Available" : "Empty"}`, newStatus ? "success" : "info");
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    diesel ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30" : "bg-white/5 text-white/40 border border-white/10"
                  }`}>
                    {diesel ? "Available ✓" : "Out of Stock ✕"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-black/20 p-5 rounded-3xl border border-white/5">
                      <p className="text-[10px] font-bold text-amber-300/50 uppercase tracking-widest mb-1">Current Price</p>
                      <div className="flex items-center gap-2">
                        <input 
                          title="Diesel Price"
                          type="number"
                          value={dieselPrice}
                          onChange={(e) => setDieselPrice(Number(e.target.value))}
                          onBlur={async () => {
                             await fetch("/api/stations/update", {
                               method: "PUT",
                               headers: { "Content-Type": "application/json" },
                               body: JSON.stringify({ stationId: activeStationId, dieselPrice })
                             });
                             showToast("Diesel price updated", "success");
                          }}
                          className="bg-transparent text-2xl font-black text-white w-20 outline-none"
                        />
                        <span className="text-sm font-bold text-amber-400">ETB/L</span>
                      </div>
                   </div>
                   <div className="bg-black/20 p-5 rounded-3xl border border-white/5">
                      <p className="text-[10px] font-bold text-amber-300/50 uppercase tracking-widest mb-1">Stock Level</p>
                      <div className="flex items-center gap-2">
                         <p className="text-2xl font-black text-white">{dieselQty.toLocaleString()}</p>
                         <span className="text-sm font-bold text-amber-400">Litres</span>
                      </div>
                   </div>
                </div>

                <div className="flex gap-3">
                   <button 
                    onClick={() => {
                      const amount = Number(prompt("Add Diesel (Litres):", "1000"));
                      if (amount) {
                         const newQty = dieselQty + amount;
                         setDieselQty(newQty);
                         fetch("/api/stations/update", {
                           method: "PUT",
                           headers: { "Content-Type": "application/json" },
                           body: JSON.stringify({ stationId: activeStationId, dieselQty: newQty })
                         });
                         showToast(`Added ${amount}L of Diesel`, "success");
                      }
                    }}
                    className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-widest transition-all"
                   >
                     + Add Stock
                   </button>
                </div>
              </div>
           </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: Clock,
              label: "Queue Size",
              value: throughput.queueSize,
              color: "from-indigo-500 to-purple-600",
              bgColor: "bg-indigo-500/10",
              iconColor: "text-indigo-400",
              trend: "+12%",
              trendUp: true
            },
            {
              icon: CheckCircle,
              label: "Fulfilled Today",
              value: throughput.todayApproved,
              color: "from-emerald-500 to-teal-600",
              bgColor: "bg-emerald-500/10",
              iconColor: "text-emerald-400",
              trend: "+8%",
              trendUp: true
            },
            {
              icon: XCircle,
              label: "Declined Today",
              value: throughput.todayRejected,
              color: "from-red-500 to-rose-600",
              bgColor: "bg-red-500/10",
              iconColor: "text-red-400",
              trend: "-3%",
              trendUp: false
            }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{stat.label}</p>
                  <p className="text-4xl font-bold text-white">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trendUp ? (
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-400" />
                    )}
                    <span className={`text-xs ${stat.trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stat.trend}
                    </span>
                    <span className="text-xs text-slate-500">vs yesterday</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="flex flex-wrap gap-1 p-4 border-b border-white/10">
            {[
              { id: "pending" as const, label: "Operations Queue", icon: Clock, count: pendingRequests.length },
              { id: "analytics" as const, label: "Business Insights", icon: BarChart3, count: null },
              { id: "history" as const, label: "Transaction Logs", icon: CheckCircle, count: null }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-[0_10px_25px_rgba(79,70,229,0.4)] border border-indigo-400/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-white" : "text-indigo-400/60"}`} />
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className={`ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-black ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-indigo-500/20 text-indigo-300"
                    }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === "analytics" ? (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-lg font-semibold text-white">Performance Analytics</h3>
                    <div className="flex gap-2">
                      {(["today", "7d", "30d"] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => setAnalyticsRange(r)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${analyticsRange === r
                            ? "bg-indigo-500 text-white"
                            : "bg-white/5 text-slate-400 hover:bg-white/10"
                            }`}
                        >
                          {r === "today" ? "Today" : r === "7d" ? "7 Days" : "30 Days"}
                        </button>
                      ))}
                      <button
                        onClick={exportCSV}
                        disabled={!analytics}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                    </div>
                  </div>

                  {loadingAnalytics || !analytics ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                          { icon: Fuel, label: "Total Volume", value: `${analytics.totals?.totalLitres ?? 0}L`, color: "indigo" },
                          { icon: DollarSign, label: "Estimated Revenue", value: `${(analytics.totals?.totalRevenue ?? 0).toLocaleString()} ETB`, color: "emerald" },
                          { icon: Users, label: "Total Transactions", value: analytics.totals?.count ?? 0, color: "purple" }
                        ].map((metric, idx) => (
                          <div key={metric.label} className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/5 hover:border-white/10 transition-all">
                            <div className="flex items-center gap-4 mb-4">
                              <div className={`p-3 rounded-2xl bg-${metric.color}-500/10 border border-${metric.color}-500/20`}>
                                <metric.icon className={`w-5 h-5 text-${metric.color}-400`} />
                              </div>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{metric.label}</p>
                            </div>
                            <p className="text-3xl font-black text-white tracking-tight">{metric.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {analytics.byDay && analytics.byDay.length > 0 && (
                          <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-indigo-400" />
                              Sales Trend
                            </h4>
                            <Bar
                              data={{
                                labels: analytics.byDay.map((d) => `${d._id.d}/${d._id.m}`),
                                datasets: [
                                  {
                                    label: "Litres",
                                    data: analytics.byDay.map((d) => d.litres),
                                    backgroundColor: "rgba(99,102,241,0.8)",
                                    borderRadius: 8,
                                  },
                                  {
                                    label: "Revenue (ETB)",
                                    data: analytics.byDay.map((d) => d.revenue),
                                    backgroundColor: "rgba(16,185,129,0.8)",
                                    borderRadius: 8,
                                  },
                                ],
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    labels: { color: "#94a3b8", font: { size: 11 } }
                                  }
                                },
                                scales: {
                                  x: { ticks: { color: "#64748b" }, grid: { color: "#ffffff05" } },
                                  y: { ticks: { color: "#64748b" }, grid: { color: "#ffffff05" } },
                                },
                              }}
                            />
                          </div>
                        )}

                        {analytics.byFuel && analytics.byFuel.length > 0 && (
                          <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                              <Fuel className="w-4 h-4 text-amber-400" />
                              Fuel Distribution
                            </h4>
                            <div className="flex justify-center">
                              <Doughnut
                                data={{
                                  labels: analytics.byFuel.map((f) => f._id),
                                  datasets: [{
                                    data: analytics.byFuel.map((f) => f.litres),
                                    backgroundColor: ["rgba(99,102,241,0.9)", "rgba(245,158,11,0.9)"],
                                    borderColor: ["#4f46e5", "#d97706"],
                                    borderWidth: 0,
                                  }],
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: true,
                                  plugins: {
                                    legend: {
                                      position: 'bottom',
                                      labels: { color: "#94a3b8", padding: 20 }
                                    }
                                  },
                                  cutout: '70%',
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Price History Table */}
                      <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                        <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-rose-400" />
                          Price History
                        </h4>
                        {loadingPriceHistory ? (
                          <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                          </div>
                        ) : priceHistory.length === 0 ? (
                          <div className="text-center py-8 text-slate-400">
                            <Fuel className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No price changes recorded yet</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-white/10">
                                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Fuel Type</th>
                                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Price (ETB/L)</th>
                                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Recorded At</th>
                                </tr>
                              </thead>
                              <tbody>
                                {priceHistory.map((p) => (
                                  <tr key={p._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-3 px-4">
                                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${p.fuelType === "petrol"
                                        ? "bg-indigo-500/20 text-indigo-300"
                                        : "bg-amber-500/20 text-amber-300"
                                        }`}>
                                        {p.fuelType}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 font-semibold text-white">{p.price.toLocaleString()} ETB</td>
                                    <td className="py-3 px-4 text-slate-400 text-xs">{formatDateTime(p.createdAt)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {(activeTab === "pending" ? pendingRequests : historyRequests).length === 0 ? (
                    <div className="text-center py-20">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-4">
                        <Clock className="w-10 h-10 text-slate-600" />
                      </div>
                      <p className="text-slate-400 font-medium">
                        {activeTab === "pending" ? "No pending requests" : "No history available"}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {activeTab === "pending"
                          ? "All caught up! New requests will appear here."
                          : "Completed requests will show up here."}
                      </p>
                    </div>
                  ) : (
                    (activeTab === "pending" ? pendingRequests : historyRequests).map((r, idx) => (
                      <motion.div
                        key={r._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ translateY: -5 }}
                        className="group relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 hover:border-indigo-500/30 transition-all shadow-xl mb-6"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[60px] rounded-full" />
                        
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                          <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800 flex items-center justify-center text-white font-black text-3xl shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                              {r.driverId?.name?.charAt(0) ?? "?"}
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-2xl font-black text-white tracking-tight">{r.driverId?.name ?? "Guest Driver"}</h4>
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                  r.fuelType === "petrol" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                }`}>
                                  {r.fuelType === "petrol" ? "Benzene" : "Nafta"}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                  {formatDateTime(r.createdAt)}
                                </span>
                                <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                                <span className="text-indigo-300/60 text-xs font-black uppercase tracking-widest">{r.status}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            {r.status === "PENDING" ? (
                              <>
                                <button
                                  onClick={() => updateRequest(r._id, "REJECTED")}
                                  className="px-8 py-4 text-xs font-black uppercase tracking-widest text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-2xl transition-all active:scale-95"
                                >
                                  Decline
                                </button>
                                <button
                                  onClick={() => updateRequest(r._id, "APPROVED")}
                                  className="px-10 py-4 text-xs font-black uppercase tracking-widest bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl shadow-xl shadow-emerald-900/40 transition-all active:scale-95 hover:scale-105"
                                >
                                  Fill Fuel ✓
                                </button>
                              </>
                            ) : r.status === "APPROVED" ? (
                              <button
                                onClick={() => updateRequest(r._id, "COMPLETED")}
                                className="px-10 py-4 text-xs font-black uppercase tracking-widest bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl shadow-xl shadow-indigo-900/40 transition-all active:scale-95 hover:scale-105"
                              >
                                Complete ✓
                              </button>
                            ) : (
                              <div className="flex items-center gap-4">
                                <span className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.2em] border ${
                                  r.status === "COMPLETED" ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300" :
                                  r.status === "CANCELED" ? "bg-white/5 border-white/10 text-slate-500" :
                                  "bg-red-500/10 border-red-500/20 text-red-300"
                                }`}>
                                  {r.status}
                                </span>
                                <button
                                title="oklo"
                                  onClick={() => removeRequest(r._id)}
                                  className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all group/btn border border-transparent hover:border-red-500/20"
                                >
                                  <XCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showAddStation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => !stationRegisterLoading && setShowAddStation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 w-fit mb-3">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Register New Station</h3>
                  <p className="text-sm text-slate-400 mt-1">Add a new fuel station branch to your network</p>
                </div>
                <button
                  onClick={() => setShowAddStation(false)}
                  disabled={stationRegisterLoading}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleRegisterStation} className="space-y-4">
                <div>
                  <label htmlFor="station-name-input" className="text-xs font-medium text-slate-400 block mb-2">Station Name</label>
                  <input
                    id="station-name-input"
                    type="text"
                    required
                    placeholder="e.g., Central Fuel Depot"
                    value={stationForm.name}
                    onChange={(e) => setStationForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="station-location-input" className="text-xs font-medium text-slate-400 block mb-2">Station Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="station-location-input"
                      type="text"
                      required
                      placeholder="Address or coordinates"
                      value={stationForm.location}
                      onChange={(e) => setStationForm(p => ({ ...p, location: e.target.value }))}
                      className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={stationRegisterLoading}
                  className="w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all disabled:opacity-50 shadow-lg"
                >
                  {stationRegisterLoading ? "Registering..." : "Register Station"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl backdrop-blur-xl border text-sm font-medium ${t.type === "success"
                ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
                : t.type === "error"
                  ? "bg-red-500/20 border-red-400/30 text-red-200"
                  : "bg-indigo-500/20 border-indigo-400/30 text-indigo-200"
                }`}
            >
              <span>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}</span>
              <span className="flex-1">
                {typeof t.message === 'string' ? t.message : JSON.stringify(t.message)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}