"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/utils";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend, Title,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

type Toast = { id: number; message: string; type: "success" | "error" | "info" };
interface FuelRequest {
  _id: string;
  driverId: { name: string };
  fuelType: string;
  status: string;
  createdAt?: string;
}

export default function StationDashboard() {
  const router = useRouter();
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
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);
  const showToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  // This function refreshes both the stock and the request list
  const refreshData = useCallback(async () => {
    try {
      // 1. Fetch current station status (quantities/prices) for the logged-in station user
      const statusRes = await fetch("/api/stations/me");
      if (statusRes.ok) {
        const data = await statusRes.json();
        if (data && !data.error) {
          // Redirect to setup wizard if station has not completed onboarding
          if (!data.isSetupComplete) {
            router.replace("/dashboard/station/setup");
            return;
          }
          setPetrol(!!data.petrol);
          setPetrolQty(data.petrolQty ?? 0);
          setPetrolPrice(data.petrolPrice ?? 80);
          setDiesel(!!data.diesel);
          setDieselQty(data.dieselQty ?? 0);
          setDieselPrice(data.dieselPrice ?? 75);
          setAvgRating(typeof data.avgRating === "number" ? data.avgRating : null);
          setRatingCount(data.ratingCount ?? 0);
        }
      }

      // 2. Fetch recent requests
      const reqRes = await fetch("/api/request/station");
      const reqData = await reqRes.json();
      setRequests(reqData);
    } catch {
      // silent — background refresh; no user-facing action needed
    }
  }, []);
  const loadAnalytics = useCallback(async (range: "today" | "7d" | "30d" = "7d") => {
    try {
      setLoadingAnalytics(true);
      const res = await fetch(`/api/stations/me/analytics?range=${range}`);
      if (!res.ok) return;
      const data = await res.json();
      setAnalytics(data);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  const loadPriceHistory = useCallback(async () => {
    try {
      setLoadingPriceHistory(true);
      const res = await fetch("/api/stations/me/price-history");
      if (res.ok) setPriceHistory(await res.json());
    } finally {
      setLoadingPriceHistory(false);
    }
  }, []);

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
  }, [loadAnalytics, analyticsRange]);

  useEffect(() => {
    if (activeTab === "analytics") loadPriceHistory();
  }, [activeTab, loadPriceHistory]);
  useEffect(() => {
    const init = async () => {
      await refreshData();
    };
    init();
    
    // Auto-refresh requests only, to avoid overwriting user input in stock fields
    const interval = setInterval(async () => {
      try {
        const reqRes = await fetch("/api/request/station");
        const reqData = await reqRes.json();
        setRequests(reqData);
      } catch {
        // silent — background refresh; no user-facing action needed
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
      // no-op: the optimistic UI update is already applied
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

  const pendingRequests = requests.filter(r => r.status === "PENDING");
  const historyRequests = requests.filter(r => r.status !== "PENDING");

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white p-6">
      <header className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">
                Operations Center
              </h1>
              <p className="text-gray-300 mt-1">
                Monitor inventory levels, sales performance, and incoming driver requests in real time.
              </p>
            </div>
            <nav className="hidden lg:flex items-center gap-6 ml-6 border-l border-white/10 pl-6">
              <a href="/station/inventory" className="text-xs font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">
                Inventory Management
              </a>
            </nav>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 w-full md:w-auto justify-end">
            <div className={`w-full sm:w-auto flex items-center gap-4 p-4 rounded-2xl shadow-lg border ${petrol ? "border-green-500 bg-green-950" : "border-red-500 bg-red-950"}`}>
              <div className={`w-12 h-12 flex items-center justify-center rounded-full text-2xl ${petrol ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
                ⛽
              </div>
              <div>
                <p className="text-xs uppercase font-bold tracking-wide opacity-70">Petrol Stock</p>
                <div className="flex items-center gap-2">
                  <p className={`font-bold text-lg ${petrol ? "text-green-400" : "text-red-400"}`}>{petrol ? `${petrolQty} L` : "Empty"}</p>
                  <span className="text-xs opacity-60">@{petrolPrice} ETB</span>
                </div>
              </div>
            </div>

            <div className={`w-full sm:w-auto flex items-center gap-4 p-4 rounded-2xl shadow-lg border ${diesel ? "border-green-500 bg-green-950" : "border-red-500 bg-red-950"}`}>
              <div className={`w-12 h-12 flex items-center justify-center rounded-full text-2xl ${diesel ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
                🚛
              </div>
              <div>
                <p className="text-xs uppercase font-bold tracking-wide opacity-70">Diesel Stock</p>
                <div className="flex items-center gap-2">
                  <p className={`font-bold text-lg ${diesel ? "text-green-400" : "text-red-400"}`}>{diesel ? `${dieselQty} L` : "Empty"}</p>
                  <span className="text-xs opacity-60">@{dieselPrice} ETB</span>
                </div>
              </div>
            </div>
            <div className="w-full sm:w-auto flex items-center gap-4 p-4 rounded-2xl shadow-lg border border-yellow-500 bg-yellow-950">
              <div className="w-12 h-12 flex items-center justify-center rounded-full text-2xl bg-yellow-500 text-slate-900">
                ⭐
              </div>
              <div>
                <p className="text-xs uppercase font-bold tracking-wide opacity-70">
                  Station Rating
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="font-bold text-lg text-yellow-300">
                    {avgRating !== null ? avgRating.toFixed(1) : "—"}
                  </p>
                  <span className="text-[11px] opacity-70">
                    ({ratingCount} review{ratingCount === 1 ? "" : "s"})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OPERATIONS INSIGHTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-emerald-600/30 to-emerald-900/40 rounded-2xl p-4 border border-emerald-400/40 shadow-lg">
            <p className="text-xs uppercase tracking-wide text-emerald-100 font-semibold">
              Today&apos;s Queue
            </p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-200">
              {throughput.queueSize}
            </p>
            <p className="mt-1 text-xs text-emerald-100/80">
              Requests currently waiting for approval or fulfillment.
            </p>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 shadow-lg">
            <p className="text-xs uppercase tracking-wide text-blue-200/80 font-semibold">
              Fulfilled Today
            </p>
            <p className="mt-2 text-3xl font-extrabold text-blue-50">
              {throughput.todayApproved}
            </p>
            <p className="mt-1 text-xs text-blue-200/70">
              Fuel requests approved and fulfilled today.
            </p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-red-400/30 shadow-lg">
            <p className="text-xs uppercase tracking-wide text-red-200 font-semibold">
              Declined Today
            </p>
            <p className="mt-2 text-3xl font-extrabold text-red-100">
              {throughput.todayRejected}
            </p>
            <p className="mt-1 text-xs text-red-100/80">
              Review declined requests to improve service quality.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        {/* Left Column: Management */}
        <div className="lg:col-span-1 space-y-8 mt-8">
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

        {/* Right Column: Requests / Analytics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex border-b border-gray-600">
            {/* <button
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${
                activeTab === "pending"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400"
              }`}
            >
              Queue Management ({pendingRequests.length})
            </button> */}

               <button
              onClick={() => setActiveTab("analytics")}
              className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${
                activeTab === "analytics"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400"
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${
                activeTab === "history"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400"
              }`}
            >
              Recent Fulfillment
            </button>
            {/* <button
              onClick={() => setActiveTab("analytics")}
              className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${
                activeTab === "analytics"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400"
              }`}
            >
              Analytics
            </button> */}

            <button
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${
                activeTab === "pending"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400"
              }`}
            >
              Queue Management ({pendingRequests.length})
            </button>
          </div>

        {activeTab === "analytics" ? (
  <section className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-2xl font-bold">Analytics</h2>
      <div className="flex flex-wrap gap-2 text-xs items-center">
        {(["today", "7d", "30d"] as const).map((r) => (
          <button key={r} onClick={() => setAnalyticsRange(r)}
            className={`px-3 py-1 rounded-full ${analyticsRange === r ? "bg-blue-600 text-white" : "bg-white/10 text-blue-200"}`}>
            {r === "today" ? "Today" : r === "7d" ? "Last 7 days" : "Last 30 days"}
          </button>
        ))}
        <button
          onClick={exportCSV}
          disabled={!analytics}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold disabled:opacity-40 transition"
        >
          ⬇ Export CSV
        </button>
      </div>
    </div>

    {loadingAnalytics || !analytics ? (
      <p className="text-sm text-blue-200/70">Loading analytics…</p>
    ) : (
      <>
        {/* Totals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Litres", value: `${analytics.totals?.totalLitres ?? 0} L` },
            { label: "Revenue", value: `${(analytics.totals?.totalRevenue ?? 0).toLocaleString()} ETB` },
            { label: "Requests", value: analytics.totals?.count ?? 0 },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-2xl p-4 border border-white/10">
              <p className="text-xs uppercase text-blue-200/70">{s.label}</p>
              <p className="mt-2 text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Sales by Day — Bar chart */}
        {analytics.byDay && analytics.byDay.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-4 border border-white/10">
            <p className="text-xs uppercase text-blue-200/70 mb-4">Sales by Day</p>
            <Bar
              data={{
                labels: analytics.byDay.map((d) => `${d._id.d}/${d._id.m}`),
                datasets: [
                  {
                    label: "Litres",
                    data: analytics.byDay.map((d) => d.litres),
                    backgroundColor: "rgba(59,130,246,0.6)",
                    borderRadius: 6,
                  },
                  {
                    label: "Revenue (ETB)",
                    data: analytics.byDay.map((d) => d.revenue),
                    backgroundColor: "rgba(16,185,129,0.6)",
                    borderRadius: 6,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { labels: { color: "#93c5fd" } } },
                scales: {
                  x: { ticks: { color: "#93c5fd" }, grid: { color: "#ffffff10" } },
                  y: { ticks: { color: "#93c5fd" }, grid: { color: "#ffffff10" } },
                },
              }}
            />
          </div>
        )}

        {/* Fuel Mix — Doughnut */}
        {analytics.byFuel && analytics.byFuel.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-4 border border-white/10 flex flex-col items-center">
            <p className="text-xs uppercase text-blue-200/70 mb-4 self-start">Fuel Mix</p>
            <div className="w-48 h-48">
              <Doughnut
                data={{
                  labels: analytics.byFuel.map((f) => f._id),
                  datasets: [{
                    data: analytics.byFuel.map((f) => f.litres),
                    backgroundColor: ["rgba(59,130,246,0.7)", "rgba(251,191,36,0.7)"],
                    borderColor: ["#3b82f6", "#fbbf24"],
                    borderWidth: 2,
                  }],
                }}
                options={{
                  plugins: { legend: { labels: { color: "#93c5fd" } } },
                }}
              />
            </div>
          </div>
        )}

        {/* Price History */}
        <div className="bg-gray-800 rounded-2xl p-4 border border-white/10 space-y-4">
          <p className="text-xs uppercase text-blue-200/70 font-semibold">Fuel Price History</p>
          {loadingPriceHistory ? (
            <p className="text-sm text-blue-200/50">Loading price history…</p>
          ) : priceHistory.length === 0 ? (
            <p className="text-sm text-blue-200/50">No price changes recorded yet. Prices are tracked automatically when you update your inventory.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[400px] w-full text-sm">
                <thead>
                  <tr className="text-blue-200/60 text-xs">
                    <th className="text-left py-2 px-3">Fuel Type</th>
                    <th className="text-left py-2 px-3">Price (ETB/L)</th>
                    <th className="text-left py-2 px-3">Recorded At</th>
                  </tr>
                </thead>
                <tbody>
                  {priceHistory.map((p) => (
                    <tr key={p._id} className="border-t border-white/5 hover:bg-white/5">
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${p.fuelType === "petrol" ? "bg-blue-500/20 text-blue-300" : "bg-yellow-500/20 text-yellow-300"}`}>
                          {p.fuelType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white">{p.price.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-blue-200/60 text-xs">
                        {new Date(p.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    )}
  </section>
          ) : (
            <div className="space-y-4">
              {(activeTab === "pending" ? pendingRequests : historyRequests).map(
                (r) => (
                  <div
                    key={r._id}
                    className="bg-gray-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-lg transition-shadow border border-gray-700"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-bold">
                        {r.driverId?.name?.charAt(0) ?? "?"}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">
                          {r.driverId?.name ?? "Unknown Driver"}
                        </h4>
                        <p className="text-xs text-gray-400">
                          {" "}
                          Requested {r.fuelType} •{" "}
                          {formatDateTime(r.createdAt)}
                        </p>
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
                      ) : r.status === "APPROVED" ? (
                        <button
                          onClick={() => updateRequest(r._id, "COMPLETED")}
                          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md transition"
                        >
                          Mark Completed
                        </button>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                              r.status === "APPROVED"
                                ? "bg-green-700 text-green-300"
                                : r.status === "COMPLETED"
                                ? "bg-emerald-700 text-emerald-200"
                                : r.status === "CANCELED"
                                ? "bg-gray-700 text-gray-300"
                                : "bg-red-700 text-red-300"
                            }`}
                          >
                            {r.status}
                          </span>
                          <button
                            onClick={() => removeRequest(r._id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition"
                            title="Delete record"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}

              {(activeTab === "pending"
              ? pendingRequests
              : historyRequests
              ).length === 0 && (
                <div className="text-center py-20 opacity-50">
                  <p className="text-5xl mb-4">📋</p>
                  <p className="text-gray-300 font-bold text-lg">
                    All caught up — no pending requests.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
  {toasts.map((t) => (
    <div key={t.id} className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl backdrop-blur-xl border text-sm font-medium ${
      t.type === "success" ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
      : t.type === "error" ? "bg-red-500/20 border-red-400/30 text-red-200"
      : "bg-sky-500/20 border-sky-400/30 text-sky-200"}`}>
      <span>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}</span>
      <span>{t.message}</span>
    </div>
  ))}
</div>
    </div>
  );
}
